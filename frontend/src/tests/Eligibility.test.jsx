import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Eligibility from "../pages/Eligibility";

const renderEligibility = () =>
  render(
    <BrowserRouter>
      <Eligibility />
    </BrowserRouter>
  );

describe("Eligibility Page", () => {
  it("renders the heading", () => {
    renderEligibility();
    expect(screen.getByText(/Eligibility Checker/i)).toBeInTheDocument();
  });

  it("renders the age input", () => {
    renderEligibility();
    expect(screen.getByLabelText(/Your Age/i)).toBeInTheDocument();
  });

  it("renders citizenship select", () => {
    renderEligibility();
    expect(screen.getByLabelText(/Citizenship/i)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    renderEligibility();
    expect(screen.getByRole("button", { name: /Check My Eligibility/i })).toBeInTheDocument();
  });

  it("shows error on empty submit", async () => {
    renderEligibility();
    const btn = screen.getByRole("button", { name: /Check My Eligibility/i });
    fireEvent.click(btn);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("accepts age input", () => {
    renderEligibility();
    const ageInput = screen.getByLabelText(/Your Age/i);
    fireEvent.change(ageInput, { target: { value: "22" } });
    expect(ageInput.value).toBe("22");
  });

  it("shows info cards", () => {
    renderEligibility();
    // Multiple elements with "Indian Citizen" exist (option + card heading)
    expect(screen.getAllByText(/Indian Citizen/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Registered Address/i)).toBeInTheDocument();
  });
});
