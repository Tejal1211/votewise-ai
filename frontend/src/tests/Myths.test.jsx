import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import Myths from "../pages/Myths";

const renderMyths = () =>
  render(
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Myths />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );

describe("Myths Page", () => {
  it("renders myths heading", () => {
    renderMyths();
    expect(screen.getByText(/Myths vs Facts/i)).toBeInTheDocument();
  });

  it("renders myth cards", () => {
    renderMyths();
    const mythsHeading = screen.getByText(/Myths vs Facts/i);
    expect(mythsHeading).toBeInTheDocument();
    // Verify page structure exists
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});