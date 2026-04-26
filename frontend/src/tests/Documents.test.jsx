import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import Documents from "../pages/Documents";

const renderDocuments = () =>
  render(
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Documents />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );

describe("Documents Page", () => {
  it("renders documents page", () => {
    renderDocuments();
    expect(screen.getByText(/Document Checklist/i)).toBeInTheDocument();
  });

  it("renders document checklist", () => {
    renderDocuments();
    // Verify page has main role
    expect(screen.getByRole("main")).toBeInTheDocument();
    // Verify progress tracking exists
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});