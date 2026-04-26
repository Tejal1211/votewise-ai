import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import CitizenDashboard from "../pages/CitizenDashboard";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";

// Mock services
vi.mock("../services/realtimeMonitoringService", () => ({
  subscribeToUserStatus: vi.fn(),
  subscribeToNotifications: vi.fn(),
}));

vi.mock("../services/boothService", () => ({
  getNearestBooths: vi.fn(),
  getBestTimeToVote: vi.fn(),
}));

// Mock Firebase
vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
}));

const mockUser = {
  uid: "test-user-id",
  displayName: "Test User",
  email: "test@example.com",
};

const mockAuthContext = {
  user: mockUser,
  logout: vi.fn(),
};

const mockLanguageContext = {
  language: "en",
  setLanguage: vi.fn(),
  t: (key) => key,
};

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        <LanguageContext.Provider value={mockLanguageContext}>
          {component}
        </LanguageContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe("CitizenDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    renderWithProviders(<CitizenDashboard />);

    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();
  });

  it("renders dashboard with countdown timer", async () => {
    const mockSubscribeToUserStatus = vi.fn((userId, callback) => {
      callback({ status: "registered" });
      return () => {};
    });

    const mockSubscribeToNotifications = vi.fn((userId, callback) => {
      callback([]);
      return () => {};
    });

    const mockGetNearestBooths = vi.fn().mockResolvedValue({
      booths: [
        {
          boothId: "B001",
          name: "Test Booth",
          address: "123 Test St",
          crowdLevel: 50,
          waitTime: 15,
          currentVoters: 100,
          capacity: 200,
        },
      ],
    });

    vi.mocked(require("../services/realtimeMonitoringService").subscribeToUserStatus).mockImplementation(mockSubscribeToUserStatus);
    vi.mocked(require("../services/realtimeMonitoringService").subscribeToNotifications).mockImplementation(mockSubscribeToNotifications);
    vi.mocked(require("../services/boothService").getNearestBooths).mockImplementation(mockGetNearestBooths);

    renderWithProviders(<CitizenDashboard />);

    await waitFor(() => {
      expect(screen.getByText("📊 Citizen Dashboard")).toBeInTheDocument();
    });

    expect(screen.getByText("Days Until Election")).toBeInTheDocument();
    expect(screen.getByText("Registration Status")).toBeInTheDocument();
    expect(screen.getByText("Booth Queue Status")).toBeInTheDocument();
  });

  it("displays nearby polling booths", async () => {
    const mockSubscribeToUserStatus = vi.fn((userId, callback) => {
      callback({ status: "registered" });
      return () => {};
    });

    const mockSubscribeToNotifications = vi.fn((userId, callback) => {
      callback([]);
      return () => {};
    });

    const mockGetNearestBooths = vi.fn().mockResolvedValue({
      booths: [
        {
          boothId: "B001",
          name: "City Central School",
          address: "123 Main St",
          crowdLevel: 45,
          waitTime: 15,
          currentVoters: 90,
          capacity: 200,
        },
      ],
    });

    vi.mocked(require("../services/realtimeMonitoringService").subscribeToUserStatus).mockImplementation(mockSubscribeToUserStatus);
    vi.mocked(require("../services/realtimeMonitoringService").subscribeToNotifications).mockImplementation(mockSubscribeToNotifications);
    vi.mocked(require("../services/boothService").getNearestBooths).mockImplementation(mockGetNearestBooths);

    renderWithProviders(<CitizenDashboard />);

    await waitFor(() => {
      expect(screen.getByText("📍 Nearby Polling Booths")).toBeInTheDocument();
    });

    expect(screen.getByText("City Central School")).toBeInTheDocument();
    expect(screen.getByText("123 Main St")).toBeInTheDocument();
  });

  it("handles booth selection and shows details", async () => {
    const mockSubscribeToUserStatus = vi.fn((userId, callback) => {
      callback({ status: "registered" });
      return () => {};
    });

    const mockSubscribeToNotifications = vi.fn((userId, callback) => {
      callback([]);
      return () => {};
    });

    const mockGetNearestBooths = vi.fn().mockResolvedValue({
      booths: [
        {
          boothId: "B001",
          name: "Test Booth",
          address: "123 Test St",
          crowdLevel: 50,
          waitTime: 15,
          currentVoters: 100,
          capacity: 200,
          openTime: "07:00 AM",
          closeTime: "6:00 PM",
        },
      ],
    });

    const mockGetBestTimeToVote = vi.fn().mockResolvedValue({
      suggestedTime: "Morning (7 AM - 10 AM)",
      estimatedWaitTime: 5,
    });

    vi.mocked(require("../services/realtimeMonitoringService").subscribeToUserStatus).mockImplementation(mockSubscribeToUserStatus);
    vi.mocked(require("../services/realtimeMonitoringService").subscribeToNotifications).mockImplementation(mockSubscribeToNotifications);
    vi.mocked(require("../services/boothService").getNearestBooths).mockImplementation(mockGetNearestBooths);
    vi.mocked(require("../services/boothService").getBestTimeToVote).mockImplementation(mockGetBestTimeToVote);

    renderWithProviders(<CitizenDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Test Booth")).toBeInTheDocument();
    });

    const boothButton = screen.getByText("Test Booth");
    fireEvent.click(boothButton);

    await waitFor(() => {
      expect(screen.getByText("Selected Booth")).toBeInTheDocument();
    });

    expect(screen.getByText("B001")).toBeInTheDocument();
    expect(screen.getByText("07:00 AM - 6:00 PM")).toBeInTheDocument();
  });

  it("displays notifications", async () => {
    const mockSubscribeToUserStatus = vi.fn((userId, callback) => {
      callback({ status: "registered" });
      return () => {};
    });

    const mockSubscribeToNotifications = vi.fn((userId, callback) => {
      callback([
        {
          id: "n1",
          title: "Registration Confirmed",
          message: "Your voter registration has been confirmed",
          type: "success",
        },
      ]);
      return () => {};
    });

    const mockGetNearestBooths = vi.fn().mockResolvedValue({ booths: [] });

    vi.mocked(require("../services/realtimeMonitoringService").subscribeToUserStatus).mockImplementation(mockSubscribeToUserStatus);
    vi.mocked(require("../services/realtimeMonitoringService").subscribeToNotifications).mockImplementation(mockSubscribeToNotifications);
    vi.mocked(require("../services/boothService").getNearestBooths).mockImplementation(mockGetNearestBooths);

    renderWithProviders(<CitizenDashboard />);

    await waitFor(() => {
      expect(screen.getByText("🔔 Notifications (1)")).toBeInTheDocument();
    });

    expect(screen.getByText("Registration Confirmed")).toBeInTheDocument();
    expect(screen.getByText("Your voter registration has been confirmed")).toBeInTheDocument();
  });
});
