import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Geolocation API
const mockGeolocation = {
  getCurrentPosition: vi.fn().mockImplementation((success) =>
    success({
      coords: {
        latitude: 20.5937,
        longitude: 78.9629,
      },
    })
  ),
  watchPosition: vi.fn(),
};
global.navigator.geolocation = mockGeolocation;

// Mock Firebase
vi.mock("../services/firebase", () => ({
  auth: {},
  db: {},
  googleProvider: {},
}));

vi.mock("firebase/auth", () => ({
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, cb) => {
    // Immediate callback for testing
    cb(null);
    return () => {};
  }),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  getRedirectResult: vi.fn(),
  GoogleAuthProvider: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn().mockImplementation(() => Promise.resolve({ exists: () => false })),
  getDocs: vi.fn().mockImplementation(() => Promise.resolve({ docs: [] })),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn().mockImplementation((q, callback) => {
    callback({ docs: [] });
    return () => {};
  }),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  arrayUnion: vi.fn(),
  arrayRemove: vi.fn(),
  serverTimestamp: vi.fn(),
  getFirestore: vi.fn(),
}));

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: "/" }),
  };
});
