import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import CitizenDashboard from "../pages/CitizenDashboard";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import { subscribeToUserStatus, subscribeToNotifications } from "../services/realtimeMonitoringService";
import { getNearestBooths, getBestTimeToVote } from "../services/boothService";

// Mock services
vi.mock("../services/realtimeMonitoringService", () => ({
  subscribeToUserStatus: vi.fn(() => () => {}),
  subscribeToNotifications: vi.fn(() => () => {}),
  updateUserStatus: vi.fn(),
  addNotification: vi.fn(),
}));

vi.mock("../services/boothService", () => ({
  getNearestBooths: vi.fn().mockResolvedValue({ booths: [] }),
  getBestTimeToVote: vi.fn().mockResolvedValue({ suggestedTime: "Morning", estimatedWaitTime: 5 }),
  calculateCrowdColor: vi.fn(() => "#00FF00"),
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
    
    // Default mocks
    vi.mocked(subscribeToUserStatus).mockImplementation((userId, callback) => {
      callback({ status: "registered" });
      return () => {};
    });
    vi.mocked(subscribeToNotifications).mockImplementation((userId, callback) => {
      callback([]);
      return () => {};
    });
    vi.mocked(getNearestBooths).mockResolvedValue({ booths: [] });
  });

  it("renders loading state initially", () => {
    // Force loading state by not calling callback immediately in mock
    vi.mocked(subscribeToUserStatus).mockImplementation(() => () => {});
    
    renderWithProviders(<CitizenDashboard />);
    expect(screen.getByText(/Loading dashboard/i)).toBeInTheDocument();
  });

  it("renders dashboard with countdown timer", async () => {
    renderWithProviders(<CitizenDashboard />);

    await waitFor(() => {
      expect(screen.getByText("📊 Citizen Dashboard")).toBeInTheDocument();
    });

    expect(screen.getByText(/Days Until Election/i)).toBeInTheDocument();
    expect(screen.getByText(/Registration Status/i)).toBeInTheDocument();
    expect(screen.getByText(/Booth Queue Status/i)).toBeInTheDocument();
  });

  it("displays nearby polling booths", async () => {
    const mockBooths = [
      {
        boothId: "B001",
        name: "City Central School",
        address: "123 Main St",
        crowdLevel: 45,
        waitTime: 15,
        currentVoters: 90,
        capacity: 200,
      },
    ];

    vi.mocked(getNearestBooths).mockResolvedValue({ booths: mockBooths });

    renderWithProviders(<CitizenDashboard />);

    await waitFor(() => {
      expect(screen.getByText("City Central School")).toBeInTheDocument();
    });

    expect(screen.getByText("123 Main St")).toBeInTheDocument();
    expect(screen.getByText(/45% crowd/i)).toBeInTheDocument();
  });

  it("handles booth selection and shows details", async () => {
    const mockBooths = [
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
    ];

    vi.mocked(getNearestBooths).mockResolvedValue({ booths: mockBooths });
    vi.mocked(getBestTimeToVote).mockResolvedValue({
      suggestedTime: "Morning (7 AM - 10 AM)",
      estimatedWaitTime: 5,
    });

    renderWithProviders(<CitizenDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Test Booth")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Test Booth"));

    await waitFor(() => {
      expect(screen.getByText("📌 Selected Booth")).toBeInTheDocument();
    });

    expect(screen.getByText("B001")).toBeInTheDocument();
    expect(screen.getByText(/07:00 AM - 6:00 PM/i)).toBeInTheDocument();
    expect(screen.getByText(/Morning \(7 AM - 10 AM\)/i)).toBeInTheDocument();
  });

  it("displays notifications", async () => {
    vi.mocked(subscribeToNotifications).mockImplementation((userId, callback) => {
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

    renderWithProviders(<CitizenDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Notifications \(1\)/i)).toBeInTheDocument();
    });

    expect(screen.getByText("Registration Confirmed")).toBeInTheDocument();
    expect(screen.getByText("Your voter registration has been confirmed")).toBeInTheDocument();
  });
});
