import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const { signInWithGoogle, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true);
      setError("");
      await signInWithGoogle({ redirectFallback: true });
      navigate("/dashboard");
    } catch (err) {
      const errorMessages = {
        "auth/popup-blocked": "Popup was blocked. Please enable popups in your browser settings.",
        "auth/popup-closed-by-user": "Signup cancelled. Please try again.",
        "auth/operation-not-supported-in-this-environment": "Firebase is not properly configured. Please check the console and ensure your .env file is set up.",
        "auth/auth-domain-config-required": "Authentication domain not configured. Please check your Firebase settings.",
      };
      
      const msg = errorMessages[err.code] || 
                  (err.message?.includes("invalidated") ? "Firebase configuration invalid. Check your .env file." :
                   err.message);
      
      setError(msg);
      console.error("Google Signup Error:", err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm)
      return setError("Please fill in all fields.");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirm)
      return setError("Passwords do not match.");
    try {
      setLoading(true);
      setError("");
      await signUpWithEmail(form.email, form.password, form.name);
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err.code === "auth/email-already-in-use"
          ? "Email already registered. Please login."
          : "Signup failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main-content" className="min-h-screen mesh-bg pt-16 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="card shadow-2xl animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
              <span className="text-white text-2xl font-bold">V</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-primary-900">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Join thousands of informed voters</p>
          </div>

          <button
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 transition-all hover:shadow-md disabled:opacity-60 mb-6"
            aria-label="Sign up with Google"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {googleLoading ? "Creating account..." : "Sign up with Google"}
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-sm">or with email</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4 flex gap-2" role="alert">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              {[
                { id: "name", label: "Full Name", type: "text", placeholder: "Rahul Sharma", autoComplete: "name" },
                { id: "email", label: "Email Address", type: "email", placeholder: "you@example.com", autoComplete: "email" },
                { id: "password", label: "Password", type: "password", placeholder: "At least 6 characters", autoComplete: "new-password" },
                { id: "confirm", label: "Confirm Password", type: "password", placeholder: "Repeat password", autoComplete: "new-password" },
              ].map((f) => (
                <div key={f.id}>
                  <label htmlFor={f.id} className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                  <input
                    id={f.id}
                    type={f.type}
                    autoComplete={f.autoComplete}
                    value={form[f.id]}
                    onChange={(e) => setForm({ ...form, [f.id]: e.target.value })}
                    className="input-field"
                    placeholder={f.placeholder}
                    required
                  />
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Creating Account...</>
              ) : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Signup;
