import { describe, it, expect, vi } from "vitest";

import { getElectionData, getPollingLocations } from "../services/googleAPI";

describe("Google API Service", () => {
  it("exports Google API functions", () => {

    expect(typeof getElectionData).toBe("function");
    expect(typeof getPollingLocations).toBe("function");
  });
});