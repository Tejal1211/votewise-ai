import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Footer from "../components/Footer";

describe("Footer Component", () => {
  it("renders footer", () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders footer links", () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    // Verify footer has links
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });
});