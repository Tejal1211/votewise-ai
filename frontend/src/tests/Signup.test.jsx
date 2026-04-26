import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import Signup from "../pages/Signup";

const renderSignup = () =>
  render(
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Signup />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );

describe("Signup Page", () => {
  it("renders signup heading", async () => {
    renderSignup();
    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(/Create Account/i);
  });

  it("renders form fields", () => {
    renderSignup();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
  });

  it("renders Google sign-up button", () => {
    renderSignup();
    expect(screen.getByLabelText(/Sign up with Google/i)).toBeInTheDocument();
  });

  it("renders sign in link", () => {
    renderSignup();
    expect(screen.getByText(/Already have an account?/i)).toBeInTheDocument();
  });

  it("shows validation error on empty form submit", async () => {
    renderSignup();
    const submitBtn = screen.getAllByRole("button").find(
      (btn) => btn.type === "submit"
    );
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("accepts form inputs", () => {
    renderSignup();
    const nameInput = screen.getByPlaceholderText(/Rahul Sharma/i);
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/At least 6 characters/i);
    const confirmInput = screen.getByPlaceholderText(/Repeat password/i);
    
    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmInput, { target: { value: "password123" } });

    expect(nameInput.value).toBe("John Doe");
    expect(emailInput.value).toBe("john@example.com");
  });
});