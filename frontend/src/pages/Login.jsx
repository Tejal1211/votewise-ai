import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { signInWithGoogle, signInWithEmail, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setError("");
      await signInWithGoogle({ redirectFallback: true });
      navigate("/dashboard");
    } catch (err) {
      const errorMessages = {
        "auth/popup-blocked": "Popup was blocked. Please enable popups in your browser settings.",
        "auth/popup-closed-by-user": "Login cancelled. Please try again.",
        "auth/operation-not-supported-in-this-environment": "Firebase is not properly configured. Please check the console and ensure your .env file is set up.",
        "auth/auth-domain-config-required": "Authentication domain not configured. Please check your Firebase settings.",
      };
      
      const msg = errorMessages[err.code] || 
                  (err.message?.includes("invalidated") ? "Firebase configuration invalid. Check your .env file." :
                   err.message);
      
      setError(msg);
      console.error("Google Login Error:", err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError("Please fill in all fields.");
    try {
      setLoading(true);
      setError("");
      await signInWithEmail(email, password);
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err.code === "auth/invalid-credential"
          ? "Invalid email or password."
          : err.code === "auth/too-many-requests"
          ? "Too many attempts. Try again later."
          : "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!resetEmail) return setError("Please enter your email.");
    try {
      setResetLoading(true);
      setError("");
      await resetPassword(resetEmail);
      setResetSuccess(true);
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <main id="main-content" className="min-h-screen mesh-bg pt-16 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card shadow-2xl animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
              <span className="text-white text-2xl font-bold">V</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-primary-900">Welcome Back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to continue your voter journey</p>
          </div>

          {/* Google Sign-In */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed mb-6"
            aria-label="Sign in with Google"
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
            {googleLoading ? "Signing in..." : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6" role="separator">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-sm">or sign in with email</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4 flex items-center gap-2" role="alert">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Email form */}
          <form onSubmit={handleEmailLogin} noValidate>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter your password"
                  required
                  aria-required="true"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          {/* Forgot Password */}
          <div className="mt-4">
            <button
              onClick={() => setResetEmail(email)}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Forgot your password?
            </button>
            {resetEmail && (
              <form onSubmit={handlePasswordReset} className="mt-2">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="input-field"
                  placeholder="Enter your email"
                  required
                />
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="btn-secondary w-full mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {resetLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    "Send Reset Email"
                  )}
                </button>
                {resetSuccess && (
                  <p className="text-green-600 text-sm mt-2">
                    Reset email sent! Check your inbox.
                  </p>
                )}
              </form>
            )}
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
