import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import Dashboard from "../pages/Dashboard";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc } from "firebase/firestore";

// Mock a user for testing
const mockUser = {
  uid: "test-uid",
  email: "test@example.com",
  displayName: "Test User",
  photoURL: "https://example.com/photo.jpg"
};

const renderDashboard = () =>
  render(
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Dashboard />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );

describe("Dashboard Page", () => {
  it("renders dashboard page", async () => {
    // Mock onAuthStateChanged to return a user
    vi.mocked(onAuthStateChanged).mockImplementation((auth, cb) => {
      cb(mockUser);
      return () => {};
    });

    // Mock getDoc to return user data
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ name: "Test User", email: "test@example.com" })
    });

    renderDashboard();
    expect(await screen.findByRole("main")).toBeInTheDocument();
  });

  it("renders dashboard content", async () => {
    // Mock onAuthStateChanged to return a user
    vi.mocked(onAuthStateChanged).mockImplementation((auth, cb) => {
      cb(mockUser);
      return () => {};
    });

    // Mock getDoc to return user data
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ name: "Test User", email: "test@example.com" })
    });

    renderDashboard();
    // Verify navigation exists
    const links = await screen.findAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });
});