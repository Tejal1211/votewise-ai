import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import AdminDashboard from "../pages/AdminDashboard";
import { AuthContext } from "../context/AuthContext";

// Mock services
vi.mock("../services/realtimeMonitoringService", () => ({
  subscribeToBoothHeatmap: vi.fn(),
  subscribeToRegionTurnout: vi.fn(),
  subscribeToSystemHealth: vi.fn(),
  subscribeToSecurityAlerts: vi.fn(),
  subscribeToDuplicateFaceAttempts: vi.fn(),
  subscribeLiveUserCount: vi.fn(),
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
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock fetch for admin stats
    global.fetch = vi.fn();
  });

  it("renders loading state initially", () => {
    renderWithProviders(<AdminDashboard />);

    expect(screen.getByText("Loading admin dashboard...")).toBeInTheDocument();
  });

  it("renders admin dashboard with overview stats", async () => {
    const mockStats = {
      overview: {
        totalBooths: 15,
        activeBooths: 14,
        totalVoters: 2500,
        totalCapacity: 3000,
        timestamp: new Date(),
      },
      regions: [
        {
          regionId: "R001",
          name: "Central Region",
          turnoutPercentage: 62.5,
          totalBooths: 8,
          avgWaitTime: 28,
        },
      ],
      booths: [
        {
          boothId: "B001",
          name: "City School",
          crowdLevel: 45,
          waitTime: 15,
          turnout: "75%",
        },
      ],
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStats),
    });

    // Mock realtime subscriptions
    vi.mocked(require("../services/realtimeMonitoringService").subscribeToBoothHeatmap).mockImplementation((regionId, callback) => {
      callback(mockStats.booths);
      return () => {};
    });

    vi.mocked(require("../services/realtimeMonitoringService").subscribeToRegionTurnout).mockImplementation((regionId, callback) => {
      callback(mockStats.regions[0]);
      return () => {};
    });

    vi.mocked(require("../services/realtimeMonitoringService").subscribeToSystemHealth).mockImplementation((callback) => {
      callback({ status: "operational", uptime: "99.8%" });
      return () => {};
    });

    vi.mocked(require("../services/realtimeMonitoringService").subscribeToSecurityAlerts).mockImplementation((callback) => {
      callback([]);
      return () => {};
    });

    vi.mocked(require("../services/realtimeMonitoringService").subscribeToDuplicateFaceAttempts).mockImplementation((callback) => {
      callback([]);
      return () => {};
    });

    vi.mocked(require("../services/realtimeMonitoringService").subscribeLiveUserCount).mockImplementation((callback) => {
      callback({ activeUsers: 1247, requestsPerSecond: 342 });
      return () => {};
    });

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("📊 Admin Dashboard")).toBeInTheDocument();
    });

    expect(screen.getByText("Total Booths")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("Total Voters Processed")).toBeInTheDocument();
    expect(screen.getByText("2,500")).toBeInTheDocument();
  });

  it("displays booth heatmap with crowd levels", async () => {
    const mockStats = {
      overview: {
        totalBooths: 15,
        activeBooths: 14,
        totalVoters: 2500,
        totalCapacity: 3000,
        timestamp: new Date(),
      },
      regions: [
        {
          regionId: "R001",
          name: "Central Region",
          turnoutPercentage: 62.5,
          totalBooths: 8,
          avgWaitTime: 28,
        },
      ],
      booths: [
        {
          boothId: "B001",
          name: "City School",
          crowdLevel: 85,
          waitTime: 45,
          turnout: "75%",
        },
        {
          boothId: "B002",
          name: "Town Hall",
          crowdLevel: 25,
          waitTime: 5,
          turnout: "60%",
        },
      ],
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStats),
    });

    // Mock realtime subscriptions
    vi.mocked(require("../services/realtimeMonitoringService").subscribeToBoothHeatmap).mockImplementation((regionId, callback) => {
      callback(mockStats.booths);
      return () => {};
    });

    vi.mocked(require("../services/realtimeMonitoringService").subscribeToRegionTurnout).mockImplementation((regionId, callback) => {
      callback(mockStats.regions[0]);
      return () => {};
    });

    vi.mocked(require("../services/realtimeMonitoringService").subscribeToSystemHealth).mockImplementation((callback) => {
      callback({ status: "operational", uptime: "99.8%" });
      return () => {};
    });

    vi.mocked(require("../services/realtimeMonitoringService").subscribeToSecurityAlerts).mockImplementation((callback) => {
      callback([]);
      return () => {};
    });

    vi.mocked(require("../services/realtimeMonitoringService").subscribeToDuplicateFaceAttempts).mockImplementation((callback) => {
      callback([]);
      return () => {};
    });

    vi.mocked(require("../services/realtimeMonitoringService").subscribeLiveUserCount).mockImplementation((callback) => {
      callback({ activeUsers: 1247, requestsPerSecond: 342 });
      return () => {};
    });

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("🗺️ Booth Crowd Heatmap")).toBeInTheDocument();
    });

    expect(screen.getByText("City School")).toBeInTheDocument();
    expect(screen.getByText("Town Hall")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
  });

  it("displays system health and security alerts", async () => {
    const mockStats = {
      overview: {
        totalBooths: 15,
        activeBooths: 14,
        totalVoters: 2500,
        totalCapacity: 3000,
        timestamp: new Date(),
      },
      regions: [],
      booths: [],
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStats),
    });

    // Mock realtime subscriptions
    vi.mocked(require("../services/realtimeMonitoringService").subscribeToBoothHeatmap).mockImplementation((regionId, callback) => {
      callback([]);
      return () => {};
    });

    vi.mocked(require("../services/realtimeMonitoringService").subscribeToRegionTurnout).mockImplementation((regionId, callback) => {
      callback(null);
      return () => {};
    });

    vi.mocked(require("../services/realtimeMonitoringService").subscribeToSystemHealth).mockImplementation((callback) => {
      callback({ status: "operational", uptime: "99.8%", activeConnections: 1247 });
      return () => {};
    });

    vi.mocked(require("../services/realtimeMonitoringService").subscribeToSecurityAlerts).mockImplementation((callback) => {
      callback([
        {
          id: "A1",
          type: "HIGH_CROWD",
          message: "Booth B002 crowding at 78%",
          severity: "warning",
          timestamp: new Date(),
        },
      ]);
      return () => {};
    });

    vi.mocked(require("../services/realtimeMonitoringService").subscribeToDuplicateFaceAttempts).mockImplementation((callback) => {
      callback([
        {
          id: "D1",
          timestamp: new Date(),
        },
      ]);
      return () => {};
    });

    vi.mocked(require("../services/realtimeMonitoringService").subscribeLiveUserCount).mockImplementation((callback) => {
      callback({ activeUsers: 1247, requestsPerSecond: 342 });
      return () => {};
    });

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("🏥 System Health")).toBeInTheDocument();
    });

    expect(screen.getByText("🟢 operational")).toBeInTheDocument();
    expect(screen.getByText("99.8%")).toBeInTheDocument();
    expect(screen.getByText("⚠️ Security Alerts (1)")).toBeInTheDocument();
    expect(screen.getByText("Booth B002 crowding at 78%")).toBeInTheDocument();
    expect(screen.getByText("🔍 Fraud Detection (1)")).toBeInTheDocument();
  });

  it("handles region selection", async () => {
    const mockStats = {
      overview: {
        totalBooths: 15,
        activeBooths: 14,
        totalVoters: 2500,
        totalCapacity: 3000,
        timestamp: new Date(),
      },
      regions: [
        {
          regionId: "R001",
          name: "Central Region",
          turnoutPercentage: 62.5,
          totalBooths: 8,
          avgWaitTime: 28,
        },
        {
          regionId: "R002",
          name: "South Region",
          turnoutPercentage: 71.2,
          totalBooths: 7,
          avgWaitTime: 15,
        },
      ],
      booths: [],
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStats),
    });

    // Mock realtime subscriptions
    vi.mocked(require("../services/realtimeMonitoringService").subscribeToBoothHeatmap).mockImplementation((regionId, callback) => {
      callback([]);
      return () => {};
    });

    vi.mocked(require("../services/realtimeMonitoringService").subscribeToRegionTurnout).mockImplementation((regionId, callback) => {
      const region = mockStats.regions.find(r => r.regionId === regionId);
      callback(region);
      return () => {};
    });

    vi.mocked(require("../services/realtimeMonitoringService").subscribeToSystemHealth).mockImplementation((callback) => {
      callback({ status: "operational", uptime: "99.8%" });
      return () => {};
    });

    vi.mocked(require("../services/realtimeMonitoringService").subscribeToSecurityAlerts).mockImplementation((callback) => {
      callback([]);
      return () => {};
    });

    vi.mocked(require("../services/realtimeMonitoringService").subscribeToDuplicateFaceAttempts).mockImplementation((callback) => {
      callback([]);
      return () => {};
    });

    vi.mocked(require("../services/realtimeMonitoringService").subscribeLiveUserCount).mockImplementation((callback) => {
      callback({ activeUsers: 1247, requestsPerSecond: 342 });
      return () => {};
    });

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Central Region")).toBeInTheDocument();
    });

    const southRegionButton = screen.getByText("South Region");
    fireEvent.click(southRegionButton);

    await waitFor(() => {
      expect(screen.getByText("71.2%")).toBeInTheDocument();
    });
  });
});
