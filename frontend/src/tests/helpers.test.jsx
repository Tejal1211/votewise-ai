import { describe, it, expect } from "vitest";

import * as helpers from "../utils/helpers";

describe("Helpers Utils", () => {
  it("exports helper functions", () => {
    // Verify it's an object with functions
    expect(typeof helpers).toBe("object");
    expect(Object.keys(helpers).length > 0).toBe(true);
  });
});