import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import PollingBoothFinder from "../pages/PollingBoothFinder";
import { AuthContext } from "../context/AuthContext";

// Mock services
vi.mock("../services/boothService", () => ({
  getNearestBooths: vi.fn(),
  getBoothDirections: vi.fn(),
  calculateCrowdColor: vi.fn(),
}));

// Mock Google Maps
vi.mock("../services/boothService", () => ({
  getNearestBooths: vi.fn(),
  getBoothDirections: vi.fn(),
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

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

// Mock window.google
const mockGoogleMaps = {
  Map: vi.fn().mockImplementation(() => ({
    setCenter: vi.fn(),
  })),
  Marker: vi.fn().mockImplementation(() => ({
    addListener: vi.fn(),
    setMap: vi.fn(),
  })),
  SymbolPath: {
    CIRCLE: "circle",
  },
  InfoWindow: vi.fn().mockImplementation(() => ({
    open: vi.fn(),
  })),
};

beforeEach(() => {
  vi.clearAllMocks();

  // Mock geolocation
  Object.defineProperty(navigator, 'geolocation', {
    value: {
      getCurrentPosition: vi.fn().mockImplementation((success) =>
        success({
          coords: {
            latitude: 28.7041,
            longitude: 77.1025,
          },
        })
      ),
    },
    writable: true,
  });

  // Mock Google Maps
  window.google = {
    maps: mockGoogleMaps,
  };
});

describe("PollingBoothFinder", () => {
  it("renders loading state initially", () => {
    renderWithProviders(<PollingBoothFinder />);

    expect(screen.getByText("Initializing map...")).toBeInTheDocument();
  });

  it("renders map and booth finder interface", async () => {
    const mockBooths = [
      {
        boothId: "B001",
        name: "City Central School",
        address: "123 Main St, City Center",
        latitude: 28.7041,
        longitude: 77.1025,
        crowdLevel: 45,
        waitTime: 15,
        currentVoters: 90,
        capacity: 200,
      },
      {
        boothId: "B002",
        name: "Community Hall North",
        address: "456 Park Ave, North Side",
        latitude: 28.7282,
        longitude: 77.1235,
        crowdLevel: 78,
        waitTime: 45,
        currentVoters: 156,
        capacity: 200,
      },
    ];

    vi.mocked(require("../services/boothService").getNearestBooths).mockResolvedValue({
      booths: mockBooths,
    });

    renderWithProviders(<PollingBoothFinder />);

    await waitFor(() => {
      expect(screen.getByText("🗺️ Polling Booth Finder")).toBeInTheDocument();
    });

    expect(screen.getByText("Find your nearest polling booth and get directions")).toBeInTheDocument();
    expect(screen.getByText("📍 Nearby Booths (2)")).toBeInTheDocument();
  });

  it("displays booths in the list", async () => {
    const mockBooths = [
      {
        boothId: "B001",
        name: "City Central School",
        address: "123 Main St, City Center",
        latitude: 28.7041,
        longitude: 77.1025,
        crowdLevel: 45,
        waitTime: 15,
        currentVoters: 90,
        capacity: 200,
      },
    ];

    vi.mocked(require("../services/boothService").getNearestBooths).mockResolvedValue({
      booths: mockBooths,
    });

    renderWithProviders(<PollingBoothFinder />);

    await waitFor(() => {
      expect(screen.getByText("City Central School")).toBeInTheDocument();
    });

    expect(screen.getByText("123 Main St, City Center")).toBeInTheDocument();
    expect(screen.getByText("45%")).toBeInTheDocument();
    expect(screen.getByText("⏱️ 15m")).toBeInTheDocument();
  });

  it("handles booth selection and shows details", async () => {
    const mockBooths = [
      {
        boothId: "B001",
        name: "City Central School",
        address: "123 Main St, City Center",
        latitude: 28.7041,
        longitude: 77.1025,
        crowdLevel: 45,
        waitTime: 15,
        currentVoters: 90,
        capacity: 200,
        openTime: "07:00 AM",
        closeTime: "6:00 PM",
      },
    ];

    const mockDirections = {
      distance: "2.5",
      distanceUnit: "km",
      estimatedTime: 15,
      timeUnit: "minutes",
    };

    vi.mocked(require("../services/boothService").getNearestBooths).mockResolvedValue({
      booths: mockBooths,
    });

    vi.mocked(require("../services/boothService").getBoothDirections).mockResolvedValue(mockDirections);

    renderWithProviders(<PollingBoothFinder />);

    await waitFor(() => {
      expect(screen.getByText("City Central School")).toBeInTheDocument();
    });

    const boothButton = screen.getByText("City Central School");
    fireEvent.click(boothButton);

    await waitFor(() => {
      expect(screen.getByText("Selected Booth")).toBeInTheDocument();
    });

    expect(screen.getByText("B001")).toBeInTheDocument();
    expect(screen.getByText("Get Directions")).toBeInTheDocument();
    expect(screen.getByText("Open Maps")).toBeInTheDocument();
  });

  it("handles search radius changes", async () => {
    const mockBooths5km = [
      {
        boothId: "B001",
        name: "Nearby Booth",
        address: "123 Near St",
        latitude: 28.7041,
        longitude: 77.1025,
        crowdLevel: 30,
        waitTime: 10,
        currentVoters: 60,
        capacity: 200,
      },
    ];

    const mockBooths10km = [
      ...mockBooths5km,
      {
        boothId: "B002",
        name: "Farther Booth",
        address: "456 Far St",
        latitude: 28.8,
        longitude: 77.2,
        crowdLevel: 60,
        waitTime: 25,
        currentVoters: 120,
        capacity: 200,
      },
    ];

    vi.mocked(require("../services/boothService").getNearestBooths)
      .mockResolvedValueOnce({ booths: mockBooths5km })
      .mockResolvedValueOnce({ booths: mockBooths10km });

    renderWithProviders(<PollingBoothFinder />);

    await waitFor(() => {
      expect(screen.getByText("Nearby Booth")).toBeInTheDocument();
    });

    // Change radius to 10km
    const radius10Button = screen.getByText("10km");
    fireEvent.click(radius10Button);

    await waitFor(() => {
      expect(screen.getByText("Farther Booth")).toBeInTheDocument();
    });

    expect(screen.getByText("📍 Nearby Booths (2)")).toBeInTheDocument();
  });

  it("handles get directions functionality", async () => {
    const mockBooths = [
      {
        boothId: "B001",
        name: "Test Booth",
        address: "123 Test St",
        latitude: 28.7041,
        longitude: 77.1025,
        crowdLevel: 45,
        waitTime: 15,
        currentVoters: 90,
        capacity: 200,
      },
    ];

    const mockDirections = {
      distance: "1.2",
      distanceUnit: "km",
      estimatedTime: 8,
      timeUnit: "minutes",
    };

    vi.mocked(require("../services/boothService").getNearestBooths).mockResolvedValue({
      booths: mockBooths,
    });

    vi.mocked(require("../services/boothService").getBoothDirections).mockResolvedValue(mockDirections);

    // Mock window.open
    const mockOpen = vi.fn();
    window.open = mockOpen;

    renderWithProviders(<PollingBoothFinder />);

    await waitFor(() => {
      expect(screen.getByText("Test Booth")).toBeInTheDocument();
    });

    const boothButton = screen.getByText("Test Booth");
    fireEvent.click(boothButton);

    await waitFor(() => {
      expect(screen.getByText("Get Directions")).toBeInTheDocument();
    });

    const getDirectionsButton = screen.getByText("Get Directions");
    fireEvent.click(getDirectionsButton);

    await waitFor(() => {
      expect(screen.getByText("1.2 km away")).toBeInTheDocument();
      expect(screen.getByText("Est. 8m drive")).toBeInTheDocument();
    });

    const openMapsButton = screen.getByText("Open Maps");
    fireEvent.click(openMapsButton);

    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining("google.com/maps/dir"),
      "_blank"
    );
  });

  it("handles geolocation error gracefully", async () => {
    // Mock geolocation error
    navigator.geolocation.getCurrentPosition.mockImplementation((success, error) => {
      error({ code: 1, message: "Permission denied" });
    });

    vi.mocked(require("../services/boothService").getNearestBooths).mockResolvedValue({
      booths: [],
    });

    renderWithProviders(<PollingBoothFinder />);

    await waitFor(() => {
      expect(screen.getByText("🗺️ Polling Booth Finder")).toBeInTheDocument();
    });

    expect(screen.getByText("Check location permissions.")).toBeInTheDocument();
  });

  it("handles Google Maps not loaded", () => {
    // Remove Google Maps from window
    delete window.google;

    renderWithProviders(<PollingBoothFinder />);

    expect(screen.getByText("Initializing map...")).toBeInTheDocument();
  });
});
