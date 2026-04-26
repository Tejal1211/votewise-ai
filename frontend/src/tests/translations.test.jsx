import { describe, it, expect } from "vitest";
import { translations } from "../utils/translations";

describe("Translations Utils", () => {
  it("provides translations in multiple languages", () => {
    // Just verify translations object exists and has language keys
    expect(translations).toBeDefined();
    expect(translations.en).toBeDefined();
    expect(translations.hi).toBeDefined();
    expect(translations.mr).toBeDefined();
  });

  it("has English translations", () => {
    expect(typeof translations.en).toBe("object");
    expect(Object.keys(translations.en).length > 0).toBe(true);
  });

  it("has Hindi translations", () => {
    expect(typeof translations.hi).toBe("object");
    expect(Object.keys(translations.hi).length > 0).toBe(true);
  });

  it("has Marathi translations", () => {
    expect(typeof translations.mr).toBe("object");
    expect(Object.keys(translations.mr).length > 0).toBe(true);
  });
});