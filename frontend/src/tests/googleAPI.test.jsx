import { describe, it, expect, vi } from "vitest";

describe("Google API Service", () => {
  it("exports Google API functions", () => {
    const { getElectionData, getPollingLocations } = require("../services/googleAPI");

    expect(typeof getElectionData).toBe("function");
    expect(typeof getPollingLocations).toBe("function");
  });
});