import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import Chat from "../pages/Chat";

// Mock scrollIntoView for jsdom
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ reply: "Test AI response" }),
  })
);

const renderChat = () =>
  render(
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Chat />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );

describe("Chat Page", () => {
  it("renders the chat heading", () => {
    renderChat();
    expect(screen.getByText(/VoteWise AI Assistant/i)).toBeInTheDocument();
  });

  it("renders textarea input", () => {
    renderChat();
    expect(screen.getByLabelText(/Type your message/i)).toBeInTheDocument();
  });

  it("renders send button", () => {
    renderChat();
    expect(screen.getByLabelText(/Send message/i)).toBeInTheDocument();
  });

  it("renders welcome message", () => {
    renderChat();
    expect(screen.getByText(/election education assistant/i)).toBeInTheDocument();
  });

  it("renders suggested questions", () => {
    renderChat();
    expect(screen.getByText(/How do I register to vote/i)).toBeInTheDocument();
  });

  it("updates input value on typing", () => {
    renderChat();
    const input = screen.getByLabelText(/Type your message/i);
    fireEvent.change(input, { target: { value: "How to register?" } });
    expect(input.value).toBe("How to register?");
  });

  it("send button disabled when input empty", () => {
    renderChat();
    const sendBtn = screen.getByLabelText(/Send message/i);
    expect(sendBtn).toBeDisabled();
  });

  it("shows Powered by Gemini text", () => {
    renderChat();
    expect(screen.getByText(/Powered by Google Gemini/i)).toBeInTheDocument();
  });
});
