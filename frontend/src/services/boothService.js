const API_URL = import.meta.env?.VITE_API_URL || "";

/**
 * Simple cache for API responses with TTL (Time To Live)
 */
class APICache {
  constructor(ttlSeconds = 300) {
    this.cache = new Map();
    this.ttlSeconds = ttlSeconds;
  }

  set(key, value) {
    const timestamp = Date.now();
    this.cache.set(key, { value, timestamp });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    const age = (now - item.timestamp) / 1000;

    if (age > this.ttlSeconds) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

const boothCache = new APICache(300); // 5 minute TTL for booth data

/**
 * Google Maps and Polling Booth Service
 * Integrates with Google Maps and backend booth data
 * Features: Response caching, error handling, input validation
 */

/**
 * Fetches nearest polling booths with optional caching
 * @param {number} latitude - User latitude (-90 to 90)
 * @param {number} longitude - User longitude (-180 to 180)
 * @param {number} radiusKm - Search radius in kilometers
 * @param {boolean} useCache - Whether to use cached results
 * @returns {Promise<Object>} Booths data or empty array on error
 */
export const getNearestBooths = async (latitude, longitude, radiusKm = 5, useCache = true) => {
  try {
    // Validate inputs
    if (typeof latitude !== "number" || latitude < -90 || latitude > 90) {
      console.error("Invalid latitude:", latitude);
      return { booths: [] };
    }
    if (typeof longitude !== "number" || longitude < -180 || longitude > 180) {
      console.error("Invalid longitude:", longitude);
      return { booths: [] };
    }
    if (typeof radiusKm !== "number" || radiusKm <= 0) {
      console.error("Invalid radius:", radiusKm);
      return { booths: [] };
    }

    const cacheKey = `booths_${latitude}_${longitude}_${radiusKm}`;

    // Check cache first
    if (useCache) {
      const cached = boothCache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const response = await fetch(
      `${API_URL}/api/booths?lat=${latitude}&lng=${longitude}&radius=${radiusKm}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Cache the result
    if (useCache) {
      boothCache.set(cacheKey, data);
    }

    return data;
  } catch (error) {
    console.error("Error fetching nearest booths:", error);
    return { booths: [] };
  }
};

export const getBoothDirections = async (originLat, originLng, destLat, destLng) => {
  try {
    // Validate input coordinates
    if (typeof originLat !== "number" || typeof originLng !== "number" ||
        typeof destLat !== "number" || typeof destLng !== "number") {
      console.error("Invalid coordinate types");
      return null;
    }

    const response = await fetch(
      `${API_URL}/api/booth-directions?originLat=${originLat}&originLng=${originLng}&destLat=${destLat}&destLng=${destLng}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching directions:", error);
    return null;
  }
};

/**
 * Fetches detailed information for a specific booth
 * @param {string} boothId - Booth identifier
 * @returns {Promise<Object|null>} Booth details or null on error
 */
export const getBoothDetails = async (boothId) => {
  try {
    if (!boothId || typeof boothId !== "string") {
      console.error("Invalid booth ID:", boothId);
      return null;
    }

    const response = await fetch(`${API_URL}/api/booths/${encodeURIComponent(boothId)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching booth details:", error);
    return null;
  }
};

export const initGoogleMap = (elementId, center = { lat: 20.5937, lng: 78.9629 }) => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject(new Error("Google Maps not loaded"));
      return;
    }

    try {
      const map = new window.google.maps.Map(document.getElementById(elementId), {
        zoom: 12,
        center: center,
        styles: [
          {
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }],
          },
          {
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }],
          },
          {
            elementType: "labels.text.fill",
            stylers: [{ color: "#616161" }],
          },
          {
            elementType: "labels.text.stroke",
            stylers: [{ color: "#f5f5f5" }],
          },
          {
            featureType: "administrative.land_parcel",
            elementType: "labels.text.fill",
            stylers: [{ color: "#bdbdbd" }],
          },
          {
            featureType: "poi",
            elementType: "geometry",
            stylers: [{ color: "#eeeeee" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#757575" }],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#e5e5e5" }],
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9e9e9e" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#ffffff" }],
          },
          {
            featureType: "road.arterial",
            elementType: "labels.text.fill",
            stylers: [{ color: "#757575" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#dadada" }],
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#616161" }],
          },
          {
            featureType: "road.local",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9e9e9e" }],
          },
          {
            featureType: "transit.line",
            elementType: "geometry",
            stylers: [{ color: "#e5e5e5" }],
          },
          {
            featureType: "transit.station",
            elementType: "geometry",
            stylers: [{ color: "#eeeeee" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#c9c9c9" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9e9e9e" }],
          },
        ],
      });

      resolve(map);
    } catch (error) {
      reject(error);
    }
  });
};

export const addBoothMarker = (map, booth, onClick) => {
  const markerColor = booth.crowdLevel > 80 ? "FF0000" : booth.crowdLevel > 50 ? "FFA500" : "00FF00";

  const marker = new window.google.maps.Marker({
    position: { lat: booth.latitude, lng: booth.longitude },
    map: map,
    title: booth.name,
    icon: {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: `#${markerColor}`,
      fillOpacity: 0.9,
      strokeColor: "#fff",
      strokeWeight: 2,
    },
  });

  const infoWindow = new window.google.maps.InfoWindow({
    content: `
      <div style="padding: 10px; font-family: Arial, sans-serif;">
        <h3 style="margin: 0 0 8px; color: #333;">${booth.name}</h3>
        <p style="margin: 4px 0; font-size: 12px; color: #666;">
          <strong>ID:</strong> ${booth.boothId}
        </p>
        <p style="margin: 4px 0; font-size: 12px; color: #666;">
          <strong>Crowd Level:</strong> ${booth.crowdLevel}%
        </p>
        <p style="margin: 4px 0; font-size: 12px; color: #666;">
          <strong>Wait Time:</strong> ${booth.waitTime || "N/A"} min
        </p>
      </div>
    `,
  });

  marker.addListener("click", () => {
    infoWindow.open(map, marker);
    if (onClick) onClick(booth);
  });

  return marker;
};

export const calculateCrowdColor = (crowdLevel) => {
  if (crowdLevel > 80) return "#FF0000"; // Red
  if (crowdLevel > 50) return "#FFA500"; // Orange
  return "#00FF00"; // Green
};

export const getBestTimeToVote = async (boothId) => {
  try {
    const response = await fetch(`${API_URL}/api/best-vote-time?boothId=${boothId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch best time");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching best vote time:", error);
    return {
      suggestedTime: "Morning (7 AM - 10 AM)",
      estimatedWaitTime: 5,
    };
  }
};
