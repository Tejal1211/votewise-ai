import { describe, it, expect } from "vitest";
import * as helpers from "../utils/helpers";

describe("Helpers Utils", () => {
  it("formatDate formats correctly", () => {
    expect(helpers.formatDate("2024-01-15")).toBe("15 January 2024");
  });

  it("calculateDaysUntil calculates correctly", () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    expect(helpers.calculateDaysUntil(dateStr)).toBe(1);
  });

  it("getElectionStatus returns correct status", () => {
    const today = new Date().toISOString().split('T')[0];
    expect(helpers.getElectionStatus(today)).toBe("today");
    
    const wayFuture = "2099-12-31";
    expect(helpers.getElectionStatus(wayFuture)).toBe("upcoming");
  });

  it("validateEmail validates correctly", () => {
    expect(helpers.validateEmail("test@example.com")).toBe(true);
    expect(helpers.validateEmail("invalid-email")).toBe(false);
  });

  it("validateAge validates correctly", () => {
    expect(helpers.validateAge(25)).toBe(true);
    expect(helpers.validateAge(150)).toBe(false);
    expect(helpers.validateAge(-5)).toBe(false);
  });

  it("getLanguageName returns correct name", () => {
    expect(helpers.getLanguageName("hi")).toBe("हिंदी");
    expect(helpers.getLanguageName("unknown")).toBe("English");
  });

  it("truncateText truncates correctly", () => {
    expect(helpers.truncateText("Hello World", 5)).toBe("Hello...");
    expect(helpers.truncateText("Hi", 5)).toBe("Hi");
  });
});