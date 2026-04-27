import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../services/firebase";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const createUserProfile = async (firebaseUser) => {
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || "",
          photoURL: firebaseUser.photoURL || "",
          createdAt: serverTimestamp(),
          reminders: [],
          chatHistory: [],
          language: "en",
        });
      }
    } catch (err) {
      console.warn("⚠️ Firestore profile sync failed (offline or missing db). Proceeding with auth-only session.", err.message);
    }
  };

  const signInWithGoogle = async ({ redirectFallback = false } = {}) => {
    if (!auth) throw new Error("Firebase auth not initialized. Check your .env file has VITE_FIREBASE_* variables.");
    if (!googleProvider) throw new Error("Google provider not configured. Check firebase.js setup.");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (!result || !result.user) throw new Error("No user returned from Google sign-in.");

      await createUserProfile(result.user);
      console.log("✅ Google Sign-In successful:", result.user.email);
      return result;
    } catch (err) {
      if (redirectFallback && (err.code === "auth/popup-blocked" || err.code === "auth/operation-not-supported-in-this-environment")) {
        console.warn("Popup blocked or environment unsupported, falling back to redirect.", err);
        return signInWithRedirect(auth, googleProvider);
      }

      const errorMsg = err.code === "auth/popup-blocked"
        ? "Popup blocked. Please allow popups or use redirect sign-in."
        : err.code === "auth/operation-not-supported-in-this-environment"
        ? "Google Sign-In not available in this browser. Redirect will be used if possible."
        : err.message || "Google Sign-In failed. Please try again.";

      console.error("❌ Google Sign-In Error:", { code: err.code, message: errorMsg });
      throw err;
    }
  };

  const signInWithGoogleRedirect = async () => {
    if (!auth) throw new Error("Firebase auth not initialized. Check your .env file has VITE_FIREBASE_* variables.");
    if (!googleProvider) throw new Error("Google provider not configured. Check firebase.js setup.");
    return signInWithRedirect(auth, googleProvider);
  };

  useEffect(() => {
    const resolveRedirect = async () => {
      if (typeof getRedirectResult !== "function") return;
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          await createUserProfile(result.user);
          console.log("✅ Google Sign-In redirect result processed:", result.user.email);
        }
      } catch (redirectError) {
        console.warn("Google redirect result failed:", redirectError);
      }
    };

    resolveRedirect();
  }, []);

  const signUpWithEmail = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile({ ...result.user, displayName });
    return result;
  };

  const signInWithEmail = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const resetPassword = async (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const logout = () => signOut(auth);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, resetPassword, logout }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
