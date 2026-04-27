import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import AdminDashboard from "../pages/AdminDashboard";
import { AuthContext } from "../context/AuthContext";
import { 
  subscribeToBoothHeatmap, 
  subscribeToRegionTurnout, 
  subscribeToSystemHealth, 
  subscribeToSecurityAlerts, 
  subscribeToDuplicateFaceAttempts, 
  subscribeLiveUserCount 
} from "../services/realtimeMonitoringService";

// Mock services
vi.mock("../services/realtimeMonitoringService", () => ({
  subscribeToBoothHeatmap: vi.fn(() => () => {}),
  subscribeToRegionTurnout: vi.fn(() => () => {}),
  subscribeToSystemHealth: vi.fn(() => () => {}),
  subscribeToSecurityAlerts: vi.fn(() => () => {}),
  subscribeToDuplicateFaceAttempts: vi.fn(() => () => {}),
  subscribeLiveUserCount: vi.fn(() => () => {}),
}));

const mockUser = {
  uid: "admin-user-id",
  displayName: "Admin User",
  email: "admin@example.com",
  adminKey: "demo",
};

const mockAuthContext = {
  user: mockUser,
  logout: vi.fn(),
};

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe("AdminDashboard", () => {
  const defaultRegions = [{ regionId: "R001", name: "Central Region", turnoutPercentage: 50, avgWaitTime: 10 }];

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();

    // Default mocks for subscriptions
    vi.mocked(subscribeToBoothHeatmap).mockImplementation((regionId, callback) => {
      callback([]);
      return () => {};
    });
    vi.mocked(subscribeToRegionTurnout).mockImplementation((regionId, callback) => {
      callback(null);
      return () => {};
    });
    vi.mocked(subscribeToSystemHealth).mockImplementation((callback) => {
      callback({ status: "operational", uptime: "99.9%" });
      return () => {};
    });
    vi.mocked(subscribeToSecurityAlerts).mockImplementation((callback) => {
      callback([]);
      return () => {};
    });
    vi.mocked(subscribeToDuplicateFaceAttempts).mockImplementation((callback) => {
      callback([]);
      return () => {};
    });
    vi.mocked(subscribeLiveUserCount).mockImplementation((callback) => {
      callback({ activeUsers: 100, requestsPerSecond: 10 });
      return () => {};
    });
  });

  it("renders loading state initially", () => {
    global.fetch.mockReturnValue(new Promise(() => {})); 
    renderWithProviders(<AdminDashboard />);
    expect(screen.getByText(/Loading admin dashboard/i)).toBeInTheDocument();
  });

  it("renders admin dashboard with overview stats", async () => {
    const mockStats = {
      overview: { totalBooths: 15, activeBooths: 14, totalVoters: 2500, totalCapacity: 3000 },
      regions: defaultRegions,
      booths: [],
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStats),
    });

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("📊 Admin Dashboard")).toBeInTheDocument();
    });

    expect(screen.getByText("Total Booths")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("displays booth heatmap with crowd levels", async () => {
    const mockStats = {
      overview: { totalBooths: 10, activeBooths: 10, totalVoters: 1000, totalCapacity: 2000 },
      regions: defaultRegions,
      booths: [
        { boothId: "B001", name: "City School", crowdLevel: 85, waitTime: 45, turnout: 75 },
      ],
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStats),
    });

    vi.mocked(subscribeToBoothHeatmap).mockImplementation((regionId, callback) => {
      if (regionId === "R001") callback(mockStats.booths);
      return () => {};
    });

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("🗺️ Booth Crowd Heatmap")).toBeInTheDocument();
    });

    expect(screen.getByText("B001")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("displays system health and security alerts", async () => {
    const mockStats = { overview: { totalBooths: 10, totalVoters: 1000, totalCapacity: 2000 }, regions: defaultRegions, booths: [] };
    global.fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockStats) });

    vi.mocked(subscribeToSecurityAlerts).mockImplementation((callback) => {
      callback([{ id: "A1", type: "HIGH_CROWD", message: "Booth B002 crowding", severity: "warning" }]);
      return () => {};
    });

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("🏥 System Health")).toBeInTheDocument();
    });

    expect(screen.getAllByText(/operational/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Security Alerts \(1\)/i)).toBeInTheDocument();
  });

  it("handles region selection", async () => {
    const mockStats = {
      overview: { totalBooths: 10, totalVoters: 1000, totalCapacity: 2000 },
      regions: [
        { regionId: "R001", name: "Central Region", turnoutPercentage: 62.5, avgWaitTime: 20 },
        { regionId: "R002", name: "South Region", turnoutPercentage: 71.2, avgWaitTime: 15 },
      ],
      booths: [],
    };

    global.fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockStats) });

    vi.mocked(subscribeToRegionTurnout).mockImplementation((regionId, callback) => {
      const region = mockStats.regions.find(r => r.regionId === regionId);
      if (region) callback(region);
      return () => {};
    });

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Central Region")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("South Region"));

    await waitFor(() => {
      expect(screen.getByText("71.2%")).toBeInTheDocument();
    });
  });
});
