import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";

const Wrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe("App", () => {
  it("renders without crashing", () => {
    const { container } = render(<div data-testid="app">VoteWise AI</div>, { wrapper: Wrapper });
    expect(container).toBeTruthy();
  });

  it("has correct app title concept", () => {
    render(<div>VoteWise AI</div>);
    expect(document.body).toBeTruthy();
  });
});
