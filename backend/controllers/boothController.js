const { body, validationResult } = require("express-validator");

/**
 * Booth Management Controller
 * Handles polling booth data, live metrics, and admin statistics
 */

// Mock data for demo purposes
const mockBooths = [
  {
    boothId: "B001",
    name: "City Central School",
    address: "123 Main St, City Center",
    latitude: 28.7041,
    longitude: 77.1025,
    regionId: "R001",
    crowdLevel: 45,
    waitTime: 15,
    capacity: 500,
    currentVoters: 225,
    openTime: "07:00 AM",
    closeTime: "6:00 PM",
  },
  {
    boothId: "B002",
    name: "Community Hall North",
    address: "456 Park Ave, North Side",
    latitude: 28.7282,
    longitude: 77.1235,
    regionId: "R001",
    crowdLevel: 78,
    waitTime: 45,
    capacity: 400,
    currentVoters: 312,
    openTime: "07:00 AM",
    closeTime: "6:00 PM",
  },
  {
    boothId: "B003",
    name: "South District Library",
    address: "789 Oak Rd, South End",
    latitude: 28.5244,
    longitude: 77.1855,
    regionId: "R002",
    crowdLevel: 22,
    waitTime: 5,
    capacity: 450,
    currentVoters: 99,
    openTime: "07:00 AM",
    closeTime: "6:00 PM",
  },
];

const mockRegionStats = {
  R001: {
    regionId: "R001",
    name: "Central Region",
    totalBooths: 15,
    turnoutPercentage: 62.5,
    votersProcessed: 12450,
    totalRegistered: 19900,
    avgWaitTime: 28,
    highestCrowd: 85,
  },
  R002: {
    regionId: "R002",
    name: "South Region",
    totalBooths: 12,
    turnoutPercentage: 71.2,
    votersProcessed: 10890,
    totalRegistered: 15300,
    avgWaitTime: 12,
    highestCrowd: 45,
  },
};

// GET /api/booths - Get nearest polling booths
const getBooths = async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Latitude and longitude required" });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    // Calculate distance and filter booths
    const nearbyBooths = mockBooths.filter((booth) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        booth.latitude,
        booth.longitude
      );
      return distance <= radiusKm;
    });

    // Sort by distance
    nearbyBooths.sort(
      (a, b) =>
        calculateDistance(latitude, longitude, a.latitude, a.longitude) -
        calculateDistance(latitude, longitude, b.latitude, b.longitude)
    );

    res.json({
      booths: nearbyBooths,
      count: nearbyBooths.length,
      center: { lat: latitude, lng: longitude },
    });
  } catch (err) {
    console.error("Error fetching booths:", err);
    res.status(500).json({ error: "Failed to fetch booths" });
  }
};

// GET /api/booths/:id - Get booth details
const getBoothById = async (req, res) => {
  try {
    const { id } = req.params;
    const booth = mockBooths.find((b) => b.boothId === id);

    if (!booth) {
      return res.status(404).json({ error: "Booth not found" });
    }

    res.json({
      ...booth,
      rating: Math.random() * 2 + 3.5, // Random rating 3.5-5.5
      reviews: Math.floor(Math.random() * 100) + 20,
    });
  } catch (err) {
    console.error("Error fetching booth:", err);
    res.status(500).json({ error: "Failed to fetch booth" });
  }
};

// GET /api/live-status - Get live voting status
const getLiveStatus = async (req, res) => {
  try {
    const { boothId, regionId } = req.query;

    let status;

    if (boothId) {
      const booth = mockBooths.find((b) => b.boothId === boothId);
      if (!booth) {
        return res.status(404).json({ error: "Booth not found" });
      }

      // Add live metrics
      status = {
        boothId,
        crowdLevel: booth.crowdLevel + Math.random() * 10 - 5, // Simulate changes
        waitTime: Math.max(0, booth.waitTime + Math.floor(Math.random() * 6) - 3),
        currentVoters: booth.currentVoters + Math.floor(Math.random() * 5),
        status: "open",
        timestamp: new Date(),
      };
    } else if (regionId) {
      const region = mockRegionStats[regionId];
      if (!region) {
        return res.status(404).json({ error: "Region not found" });
      }

      status = {
        regionId,
        ...region,
        turnoutPercentage: region.turnoutPercentage + (Math.random() * 2 - 1),
        votersProcessed: region.votersProcessed + Math.floor(Math.random() * 10),
        avgWaitTime: region.avgWaitTime + Math.floor(Math.random() * 4) - 2,
        timestamp: new Date(),
      };
    } else {
      // Return global stats
      const allStats = {
        totalBooths: mockBooths.length,
        totalVotersProcessed: mockBooths.reduce((sum, b) => sum + b.currentVoters, 0),
        globalTurnout:
          (mockBooths.reduce((sum, b) => sum + b.currentVoters, 0) /
            mockBooths.reduce((sum, b) => sum + b.capacity, 0)) *
          100,
        avgCrowdLevel:
          mockBooths.reduce((sum, b) => sum + b.crowdLevel, 0) / mockBooths.length,
        avgWaitTime:
          mockBooths.reduce((sum, b) => sum + b.waitTime, 0) / mockBooths.length,
        timestamp: new Date(),
      };
      return res.json(allStats);
    }

    res.json(status);
  } catch (err) {
    console.error("Error fetching live status:", err);
    res.status(500).json({ error: "Failed to fetch status" });
  }
};

// GET /api/booth-directions - Get directions to booth
const getBoothDirections = async (req, res) => {
  try {
    const { originLat, originLng, destLat, destLng } = req.query;

    if (!originLat || !originLng || !destLat || !destLng) {
      return res.status(400).json({ error: "Missing coordinates" });
    }

    const distance = calculateDistance(
      parseFloat(originLat),
      parseFloat(originLng),
      parseFloat(destLat),
      parseFloat(destLng)
    );

    // Estimate time: 4 minutes per km (mixed urban traffic)
    const estimatedTime = Math.round(distance * 4);

    res.json({
      distance: distance.toFixed(2),
      distanceUnit: "km",
      estimatedTime,
      timeUnit: "minutes",
      mode: "driving",
      alternatives: [
        {
          mode: "transit",
          estimatedTime: estimatedTime + 15,
        },
        {
          mode: "walking",
          estimatedTime: Math.round(distance * 15),
        },
      ],
    });
  } catch (err) {
    console.error("Error calculating directions:", err);
    res.status(500).json({ error: "Failed to calculate directions" });
  }
};

// GET /api/best-vote-time - Get best time to vote
const getBestVoteTime = async (req, res) => {
  try {
    const { boothId } = req.query;

    if (!boothId) {
      return res.status(400).json({ error: "Booth ID required" });
    }

    // Mock rush hour patterns
    const currentHour = new Date().getHours();
    let suggestedTime, estimatedWait;

    if (currentHour < 9) {
      suggestedTime = "Now (Morning - Low crowd)";
      estimatedWait = 5;
    } else if (currentHour < 12) {
      suggestedTime = "After 12 PM (Post-lunch - Moderate crowd)";
      estimatedWait = 20;
    } else if (currentHour < 15) {
      suggestedTime = "After 3 PM (Afternoon - Moderate-High crowd)";
      estimatedWait = 30;
    } else if (currentHour < 17) {
      suggestedTime = "After 5 PM (Evening - High crowd expected)";
      estimatedWait = 45;
    } else {
      suggestedTime = "Before 6 PM (Closing time - Very high crowd)";
      estimatedWait = 60;
    }

    res.json({
      suggestedTime,
      estimatedWaitTime: estimatedWait,
      recommendation: "Visit during morning hours for shortest wait times",
      peakHours: ["12 PM - 3 PM", "4 PM - 6 PM"],
      quietHours: ["7 AM - 9 AM", "3 PM - 4 PM"],
    });
  } catch (err) {
    console.error("Error getting best vote time:", err);
    res.status(500).json({ error: "Failed to get recommendation" });
  }
};

// GET /api/admin/stats - Get admin statistics
const getAdminStats = async (req, res) => {
  try {
    // Check admin authorization (implement proper auth in production)
    const adminKey = req.headers["x-admin-key"];

    if (!adminKey) {
      return res.status(401).json({ error: "Admin authorization required" });
    }

    const stats = {
      overview: {
        totalBooths: mockBooths.length,
        activeBooths: mockBooths.filter((b) => b.crowdLevel < 100).length,
        totalVoters: mockBooths.reduce((sum, b) => sum + b.currentVoters, 0),
        totalCapacity: mockBooths.reduce((sum, b) => sum + b.capacity, 0),
        timestamp: new Date(),
      },
      regions: Object.values(mockRegionStats),
      booths: mockBooths.map((b) => ({
        boothId: b.boothId,
        name: b.name,
        crowdLevel: b.crowdLevel,
        waitTime: b.waitTime,
        turnout: ((b.currentVoters / b.capacity) * 100).toFixed(1),
      })),
      alerts: [
        {
          id: "A1",
          type: "HIGH_CROWD",
          boothId: "B002",
          message: "Booth B002 crowding at 78%",
          severity: "warning",
          timestamp: new Date(),
        },
      ],
      systemHealth: {
        status: "operational",
        uptime: "99.8%",
        activeConnections: 1247,
        requestsPerSecond: 342,
      },
    };

    res.json(stats);
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
};

// Helper function: Calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

module.exports = {
  getBooths,
  getBoothById,
  getLiveStatus,
  getBoothDirections,
  getBestVoteTime,
  getAdminStats,
};
