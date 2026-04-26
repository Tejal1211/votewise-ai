import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AuthProvider, useAuth } from "../context/AuthContext";

// Mock Firebase
vi.mock("../services/firebase", () => ({
  auth: {},
  db: {},
  googleProvider: {},
}));

const TestComponent = () => {
  const { user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, resetPassword, logout } = useAuth();
  return (
    <div>
      <div data-testid="user">{user ? "logged in" : "not logged in"}</div>
      <div data-testid="loading">{loading ? "loading" : "not loading"}</div>
      <button onClick={signInWithGoogle}>Google</button>
      <button onClick={() => signUpWithEmail("email", "pass", "name")}>Signup</button>
      <button onClick={() => signInWithEmail("email", "pass")}>Login</button>
      <button onClick={() => resetPassword("email")}>Reset</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  it("provides auth functions", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId("user")).toHaveTextContent("not logged in");
    expect(screen.getByTestId("loading")).toHaveTextContent("not loading");
    expect(screen.getByText("Google")).toBeInTheDocument();
    expect(screen.getByText("Signup")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });
});