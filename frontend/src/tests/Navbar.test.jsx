import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import Navbar from "../components/Navbar";

// Mock the contexts to avoid Firebase issues
vi.mock("../context/AuthContext", () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
  useAuth: () => ({
    user: null,
    logout: vi.fn(),
  }),
}));

vi.mock("../context/LanguageContext", () => ({
  LanguageProvider: ({ children }) => <div data-testid="language-provider">{children}</div>,
  useLang: () => ({
    language: "en",
    setLanguage: vi.fn(),
    t: (key) => key, // Return key as is for testing
  }),
}));

const renderNavbar = () =>
  render(
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Navbar />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );

describe("Navbar", () => {
  it("renders the brand logo", () => {
    renderNavbar();
    expect(screen.getByLabelText(/VoteWise AI Home/i)).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    renderNavbar();
    expect(screen.getByText(/home/i)).toBeInTheDocument();
  });

  it("has language selector", () => {
    renderNavbar();
    expect(screen.getByLabelText(/Select language/i)).toBeInTheDocument();
  });

  it("toggles mobile menu", () => {
    renderNavbar();
    const menuBtn = screen.getByLabelText(/Open menu/i);
    fireEvent.click(menuBtn);
    expect(screen.getByLabelText(/Close menu/i)).toBeInTheDocument();
  });

  it("shows login link when no user", () => {
    renderNavbar();
    expect(screen.getAllByText(/login/i).length).toBeGreaterThan(0);
  });
});
