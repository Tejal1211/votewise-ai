import { describe, it, expect } from "vitest";

describe("Helpers Utils", () => {
  it("exports helper functions", () => {
    // Import helpers module
    const helpers = require("../utils/helpers");
    
    // Verify it's an object with functions
    expect(typeof helpers).toBe("object");
    expect(Object.keys(helpers).length > 0).toBe(true);
  });
});