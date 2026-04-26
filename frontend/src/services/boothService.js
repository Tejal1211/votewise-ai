const API_URL = import.meta.env.VITE_API_URL || "";

/**
 * Google Maps and Polling Booth Service
 * Integrates with Google Maps and backend booth data
 */

export const getNearestBooths = async (latitude, longitude, radiusKm = 5) => {
  try {
    const response = await fetch(
      `${API_URL}/api/booths?lat=${latitude}&lng=${longitude}&radius=${radiusKm}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch booths");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching nearest booths:", error);
    return [];
  }
};

export const getBoothDirections = async (originLat, originLng, destLat, destLng) => {
  try {
    const response = await fetch(
      `${API_URL}/api/booth-directions?originLat=${originLat}&originLng=${originLng}&destLat=${destLat}&destLng=${destLng}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch directions");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching directions:", error);
    return null;
  }
};

export const getBoothDetails = async (boothId) => {
  try {
    const response = await fetch(`${API_URL}/api/booths/${boothId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch booth details");
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
