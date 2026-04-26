import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import Wizard from "../pages/Wizard";

const renderWizard = () =>
  render(
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Wizard />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );

describe("Wizard Page", () => {
  it("renders wizard page", () => {
    renderWizard();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders wizard content", () => {
    renderWizard();
    // Verify page has navigation or form elements
    expect(
      screen.getByRole("button", { name: /next|start/i }) ||
      screen.getByRole("button", { name: /submit/i })
    ).toBeDefined();
  });
});