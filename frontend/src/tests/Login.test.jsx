import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import Login from "../pages/Login";

const renderLogin = () =>
  render(
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Login />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );

describe("Login Page", () => {
  it("renders login heading", () => {
    renderLogin();
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
  });

  it("renders email and password fields", () => {
    renderLogin();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it("renders Google sign-in button", () => {
    renderLogin();
    expect(screen.getByLabelText(/Sign in with Google/i)).toBeInTheDocument();
  });

  it("renders sign up link", () => {
    renderLogin();
    expect(screen.getByText(/Create one free/i)).toBeInTheDocument();
  });

  it("shows validation error on empty form submit", async () => {
    renderLogin();
    // Get the submit button (type=submit) specifically
    const submitBtn = screen.getAllByRole("button").find(
      (btn) => btn.type === "submit"
    );
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("renders forgot password link", () => {
    renderLogin();
    expect(screen.getByText(/Forgot your password?/i)).toBeInTheDocument();
  });

  it("shows reset email form when forgot password clicked", () => {
    renderLogin();
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    const forgotBtn = screen.getByText(/Forgot your password?/i);
    fireEvent.click(forgotBtn);
    expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
  });

  it("accepts email input", () => {
    renderLogin();
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput.value).toBe("test@example.com");
  });
});
