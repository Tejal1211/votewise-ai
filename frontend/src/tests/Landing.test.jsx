import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import Landing from "../pages/Landing";

const renderLanding = () =>
  render(
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Landing />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );

describe("Landing Page", () => {
  it("renders landing page", () => {
    renderLanding();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    renderLanding();
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });
});