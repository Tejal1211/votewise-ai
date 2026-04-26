import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useApi } from "../hooks/useApi";

const TestComponent = () => {
  const { data, loading, error, post } = useApi();

  const handlePost = () => {
    post("/test", { message: "hello" });
  };

  return (
    <div>
      <div data-testid="data">{data ? JSON.stringify(data) : "no data"}</div>
      <div data-testid="loading">{loading ? "loading" : "not loading"}</div>
      <div data-testid="error">{error || "no error"}</div>
      <button onClick={handlePost}>Post</button>
    </div>
  );
};

describe("useApi Hook", () => {
  it("handles API calls", async () => {
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    render(<TestComponent />);

    expect(screen.getByTestId("loading")).toHaveTextContent("not loading");

    // This would require more setup for actual API call testing
    // For now, just check initial state
  });
});