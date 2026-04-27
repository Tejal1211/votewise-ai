import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, beforeAll } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Chat from "../pages/Chat";

// Mock the AuthContext module
vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// Mock the LanguageContext module
vi.mock("../context/LanguageContext", () => ({
  useLang: vi.fn(),
}));

// Mock the chatHistoryService module
vi.mock("../services/chatHistoryService", () => ({
  saveChatMessage: vi.fn().mockResolvedValue("msg-123"),
  getChatHistory: vi.fn().mockResolvedValue([]),
  subscribeToUserChatHistory: vi.fn(() => () => {}),
  clearChatHistory: vi.fn().mockResolvedValue(true),
}));

import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { getChatHistory, subscribeToUserChatHistory, saveChatMessage } from "../services/chatHistoryService";

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

const mockUser = { uid: "test-user", displayName: "Test User" };

const renderChat = () =>
  render(
    <BrowserRouter>
      <Chat />
    </BrowserRouter>
  );

describe("Chat Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    
    vi.mocked(useAuth).mockReturnValue({ user: mockUser, loading: false });
    vi.mocked(useLang).mockReturnValue({ language: "en" });
    vi.mocked(getChatHistory).mockResolvedValue([]);
    vi.mocked(subscribeToUserChatHistory).mockImplementation((uid, cb) => {
      cb([]);
      return () => {};
    });
  });

  it("renders basic components", async () => {
    renderChat();
    expect(await screen.findByText(/VoteWise AI Assistant/i)).toBeInTheDocument();
    expect(await screen.findByPlaceholderText(/Ask me anything/i)).toBeInTheDocument();
    expect(screen.getByText(/election education assistant/i)).toBeInTheDocument();
  });

  it("handles user sending a message", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ reply: "AI Response content" }),
    });

    renderChat();
    const input = await screen.findByPlaceholderText(/Ask me anything/i);
    const sendBtn = screen.getByRole("button", { name: /send/i });

    fireEvent.change(input, { target: { value: "How do I register?" } });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(input.value).toBe("");
    });

    expect(await screen.findByText(/AI Response content/i)).toBeInTheDocument();
    expect(screen.getByText(/How do I register\?/i)).toBeInTheDocument();
    expect(saveChatMessage).toHaveBeenCalled();
  });

  it("handles suggested questions", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ reply: "Suggested answer" }),
    });

    renderChat();
    const suggestion = await screen.findByText(/How do I register to vote\?/i);
    fireEvent.click(suggestion);

    expect(await screen.findByText(/Suggested answer/i)).toBeInTheDocument();
  });

  it("handles API error during message sending", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Failed" }),
    });

    renderChat();
    const input = await screen.findByPlaceholderText(/Ask me anything/i);
    fireEvent.change(input, { target: { value: "Help" } });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => {
      expect(input.value).toBe("");
    });
    // Should still show initial greeting
    expect(screen.getByText(/election education assistant/i)).toBeInTheDocument();
  });
});
