import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import Timeline from "../pages/Timeline";

const renderTimeline = () =>
  render(
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Timeline />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );

describe("Timeline Page", () => {
  it("renders timeline heading", () => {
    renderTimeline();
    expect(screen.getByText(/Election Timeline/i)).toBeInTheDocument();
  });

  it("renders timeline items", () => {
    renderTimeline();
    expect(screen.getByText(/Voter Registration Opens/i)).toBeInTheDocument();
    expect(screen.getByText(/Registration Deadline/i)).toBeInTheDocument();
  });
});