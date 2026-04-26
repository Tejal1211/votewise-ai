import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { onAuthStateChanged } from "firebase/auth";

const TestComponent = () => <div>Protected Content</div>;

describe("ProtectedRoute", () => {
  it("renders protected content when user is logged in", async () => {
    // Mock onAuthStateChanged to return a user
    vi.mocked(onAuthStateChanged).mockImplementation((auth, cb) => {
      cb({ uid: "123", email: "test@example.com" });
      return () => {};
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
  });

  it("does not render when user is not logged in", () => {
    // Mock onAuthStateChanged to return null
    vi.mocked(onAuthStateChanged).mockImplementation((auth, cb) => {
      cb(null);
      return () => {};
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});