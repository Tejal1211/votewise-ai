import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LanguageProvider, useLang } from "../context/LanguageContext";

const TestComponent = () => {
  const { language, setLanguage, t } = useLang();
  return (
    <div>
      <div data-testid="language">{language}</div>
      <button onClick={() => setLanguage("hi")}>Set Hindi</button>
      <div data-testid="translated">{t("welcome")}</div>
    </div>
  );
};

describe("LanguageContext", () => {
  it("provides language context", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    expect(screen.getByTestId("language")).toHaveTextContent("en");
    expect(screen.getByTestId("translated")).toHaveTextContent("Welcome");
  });
});