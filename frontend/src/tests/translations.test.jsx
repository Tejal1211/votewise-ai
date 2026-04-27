import { describe, it, expect } from "vitest";
import { translations } from "../utils/translations";

describe("Translations Utils", () => {
  it("provides translations in multiple languages", () => {
    expect(translations).toBeDefined();
    expect(translations.en).toBeDefined();
    expect(translations.hi).toBeDefined();
    expect(translations.mr).toBeDefined();
  });

  it("has consistent keys across languages", () => {
    const enKeys = Object.keys(translations.en).sort();
    const hiKeys = Object.keys(translations.hi).sort();
    const mrKeys = Object.keys(translations.mr).sort();
    
    expect(enKeys).toEqual(hiKeys);
    expect(enKeys).toEqual(mrKeys);
  });

  it("has essential navigation keys", () => {
    const essentialKeys = ["home", "chat", "eligibility", "timeline", "login", "logout"];
    essentialKeys.forEach(key => {
      expect(translations.en[key]).toBeDefined();
      expect(translations.hi[key]).toBeDefined();
      expect(translations.mr[key]).toBeDefined();
    });
  });
});