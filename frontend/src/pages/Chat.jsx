import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import {
  saveChatMessage,
  getChatHistory,
  subscribeToUserChatHistory,
  clearChatHistory,
} from "../services/chatHistoryService";

const API_URL = import.meta.env?.VITE_API_URL || "";

const SUGGESTED_QUESTIONS = [
  "How do I register to vote?",
  "What documents do I need to vote?",
  "Who is eligible to vote in India?",
  "What is NOTA?",
  "How does postal voting work?",
  "How are votes counted?",
];

const Chat = () => {
  const { user } = useAuth();
  const { language } = useLang();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Hello! I'm VoteWise AI, your election education assistant. I can help you understand voter registration, eligibility, voting methods, election timelines, and more. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    if (!user) return;

    const loadHistory = async () => {
      setInitialLoading(true);
      // Safety timeout to ensure loading screen vanishes
      const timeout = setTimeout(() => {
        setInitialLoading(false);
      }, 5000);

      try {
        const history = await getChatHistory(user.uid, 50);
        if (history.length > 0) {
          const formattedHistory = history.map((msg) => ({
            role: msg.role,
            content: msg.message,
            id: msg.id,
            timestamp: msg.timestamp,
          }));
          setMessages((prev) => {
            // Keep the initial greeting, then add history
            return [prev[0], ...formattedHistory];
          });
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      } finally {
        if (timeout) clearTimeout(timeout);
        setInitialLoading(false);
      }
    };

    loadHistory();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToUserChatHistory(
      user.uid,
      (messages) => {
        if (messages.length > 0) {
          const formattedHistory = messages.map((msg) => ({
            role: msg.role,
            content: msg.message,
            id: msg.id,
            timestamp: msg.timestamp,
          }));
          setMessages((prev) => {
            // Keep the initial greeting
            return [prev[0], ...formattedHistory];
          });
        }
      },
      50
    );

    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading || !user) return;

    setInput("");
    const userMessage = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Save user message to Firestore
      try {
        await saveChatMessage(user.uid, msg, "user", language);
      } catch (dbErr) {
        console.warn("⚠️ Failed to save user message to history, but proceeding with AI request.", dbErr);
      }

      // Prepare history for API (convert format)
      const history = messages
        .filter((m) => m.role && m.content)
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          content: m.content,
        }))
        .slice(-10); // Last 10 messages for context

      // Send to backend API
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: msg,
          history: history,
          language: language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.reply) {
        throw new Error("No response from AI");
      }

      const assistantMessage = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message to Firestore
      try {
        await saveChatMessage(user.uid, data.reply, "assistant", language);
      } catch (dbErr) {
        console.warn("⚠️ Failed to save assistant message to history.", dbErr);
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage = {
        role: "assistant",
        content: `⚠️ Sorry, I couldn't process your request. ${err.message || "Please try again later."}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Clear all chat history? This cannot be undone.")) {
      try {
        await clearChatHistory(user.uid);
        setMessages([
          {
            role: "assistant",
            content:
              "👋 Hello! I'm VoteWise AI, your election education assistant. I can help you understand voter registration, eligibility, voting methods, election timelines, and more. What would you like to know?",
          },
        ]);
      } catch (error) {
        console.error("Failed to clear history:", error);
      }
    }
  };

  return (
    <main id="main-content" className="min-h-screen mesh-bg pt-16" aria-label="AI Chat Assistant">
      <div className="max-w-3xl mx-auto px-4 py-8 h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl">🤖</span>
          </div>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold text-primary-900">VoteWise AI Assistant</h1>
            <p className="text-xs text-gray-500">Powered by Google Gemini - Chat history saved</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Online
            </div>
            <button
              onClick={handleClearHistory}
              className="text-xs bg-red-50 border border-red-200 text-red-600 px-3 py-1 rounded-full hover:bg-red-100 transition-colors"
              aria-label="Clear chat history"
              title="Clear all chat history"
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {initialLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading chat history...</p>
            </div>
          </div>
        )}

        {!initialLoading && (
          <>
            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto space-y-4 py-4 px-1"
              role="log"
              aria-live="polite"
              aria-label="Chat messages - conversation history"
            >
              {messages.map((msg, i) => {
                const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : "";
                const senderLabel = msg.role === "user" ? "You" : "VoteWise AI Assistant";
                const ariaLabel = `Message from ${senderLabel}${timestamp ? ` at ${timestamp}` : ""}: ${msg.content.substring(0, 50)}...`;

                return (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                    role="article"
                    aria-label={ariaLabel}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1 shadow" aria-hidden="true">
                        🤖
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        msg.role === "user" ? "chat-user" : "chat-ai"
                      }`}
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {msg.content}
                      {timestamp && (
                        <div className="text-xs opacity-60 mt-1" aria-label={`Sent at ${timestamp}`}>
                          {timestamp}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start animate-fade-in" aria-live="polite" aria-label="AI is typing">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-sm mr-2 flex-shrink-0" aria-hidden="true">
                    🤖
                  </div>
                  <div className="chat-ai px-4 py-3 flex gap-1 items-center">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <span
                        key={i}
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}s` }}
                        aria-hidden="true"
                      ></span>
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-2 text-center">Suggested questions:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      disabled={loading}
                      className="text-xs bg-white border border-primary-200 text-primary-700 px-3 py-1.5 rounded-full hover:bg-primary-50 hover:border-primary-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about voting, elections, registration..."
                disabled={loading || !user}
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-400 resize-none"
                rows="3"
                aria-label="Type your message"
              ></textarea>
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim() || !user}
                className="bg-gradient-to-r from-primary-500 to-indigo-600 text-white rounded-xl px-6 py-3 font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                {loading ? "..." : "Send"}
              </button>
            </div>

            {!user && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                Please log in to save chat history.
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default Chat;
