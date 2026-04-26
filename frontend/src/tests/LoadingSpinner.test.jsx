import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LoadingSpinner from "../components/LoadingSpinner";

describe("LoadingSpinner Component", () => {
  it("renders spinner", () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders loading text", () => {
    render(<LoadingSpinner />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });
});