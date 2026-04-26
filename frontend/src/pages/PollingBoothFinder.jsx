import { useState, useEffect, useRef } from "react";
import {
  getNearestBooths,
  getBoothDirections,
  calculateCrowdColor,
} from "../services/boothService";

const PollingBoothFinder = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [booths, setBooths] = useState([]);
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchRadius, setSearchRadius] = useState(5);
  const [directions, setDirections] = useState(null);
  const [markers, setMarkers] = useState([]);

  // Initialize map
  useEffect(() => {
    // Check if Google Maps is loaded
    if (!window.google) {
      console.error("Google Maps API not loaded");
      setLoading(false);
      return;
    }

    const defaultCenter = { lat: 28.7041, lng: 77.1025 }; // Delhi

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      center: defaultCenter,
      styles: [
        {
          elementType: "geometry",
          stylers: [{ color: "#f5f5f5" }],
        },
        {
          elementType: "labels.text.fill",
          stylers: [{ color: "#616161" }],
        },
      ],
    });

    setMap(mapInstance);

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLocation = { lat: latitude, lng: longitude };
          setLocation(userLocation);
          mapInstance.setCenter(userLocation);

          // Add user marker
          new window.google.maps.Marker({
            position: userLocation,
            map: mapInstance,
            title: "Your Location",
            icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          });
        },
        () => {
          console.warn("Location access denied, using default");
          setLocation(defaultCenter);
        }
      );
    }

    setLoading(false);
  }, []);

  // Fetch and display booths
  useEffect(() => {
    if (!location || !map) return;

    const fetchBooths = async () => {
      try {
        const data = await getNearestBooths(location.lat, location.lng, searchRadius);
        setBooths(data.booths || []);

        // Clear existing markers
        markers.forEach((marker) => marker.setMap(null));

        // Add new markers
        const newMarkers = (data.booths || []).map((booth) => {
          const marker = new window.google.maps.Marker({
            position: { lat: booth.latitude, lng: booth.longitude },
            map: map,
            title: booth.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: calculateCrowdColor(booth.crowdLevel),
              fillOpacity: 0.9,
              strokeColor: "#fff",
              strokeWeight: 2,
            },
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 10px; font-family: Arial, sans-serif; max-width: 250px;">
                <h3 style="margin: 0 0 8px; color: #333; font-size: 14px; font-weight: bold;">${booth.name}</h3>
                <p style="margin: 4px 0; font-size: 12px; color: #666;"><strong>ID:</strong> ${booth.boothId}</p>
                <p style="margin: 4px 0; font-size: 12px; color: #666;"><strong>Crowd:</strong> ${booth.crowdLevel}%</p>
                <p style="margin: 4px 0; font-size: 12px; color: #666;"><strong>Wait:</strong> ${booth.waitTime}m</p>
                <p style="margin: 8px 0 0; font-size: 11px; color: #999;">${booth.address}</p>
              </div>
            `,
          });

          marker.addListener("click", () => {
            infoWindow.open(map, marker);
            setSelectedBooth(booth);
          });

          return marker;
        });

        setMarkers(newMarkers);
      } catch (error) {
        console.error("Error fetching booths:", error);
      }
    };

    fetchBooths();
  }, [location, map, searchRadius]);

  const handleGetDirections = async () => {
    if (!selectedBooth || !location) return;

    try {
      const directions = await getBoothDirections(
        location.lat,
        location.lng,
        selectedBooth.latitude,
        selectedBooth.longitude
      );
      setDirections(directions);
    } catch (error) {
      console.error("Error fetching directions:", error);
    }
  };

  const handleOpenInMaps = () => {
    if (!selectedBooth) return;

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${selectedBooth.latitude},${selectedBooth.longitude}&destination_place_id=${selectedBooth.boothId}`;
    window.open(mapsUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen mesh-bg pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing map...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen mesh-bg pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="section-title mb-2">🗺️ Polling Booth Finder</h1>
          <p className="text-gray-600">Find your nearest polling booth and get directions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map */}
          <div className="lg:col-span-3">
            <div className="card shadow-lg overflow-hidden h-[600px]">
              <div ref={mapRef} className="w-full h-full" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Search Radius */}
            <div className="card shadow-lg p-4">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Search Radius: {searchRadius} km
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex gap-2 mt-2">
                {[2, 5, 10, 20].map((r) => (
                  <button
                    key={r}
                    onClick={() => setSearchRadius(r)}
                    className={`flex-1 text-sm px-2 py-1 rounded font-medium transition-all ${
                      searchRadius === r
                        ? "bg-primary-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {r}km
                  </button>
                ))}
              </div>
            </div>

            {/* Booths List */}
            <div className="card shadow-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                📍 Nearby Booths ({booths.length})
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {booths.map((booth) => (
                  <button
                    key={booth.boothId}
                    onClick={() => setSelectedBooth(booth)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedBooth?.boothId === booth.boothId
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-primary-300 bg-white"
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {booth.name}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span
                        className="text-xs px-2 py-0.5 rounded text-white"
                        style={{
                          backgroundColor: calculateCrowdColor(booth.crowdLevel),
                        }}
                      >
                        {booth.crowdLevel}%
                      </span>
                      <span className="text-xs text-gray-600">⏱️ {booth.waitTime}m</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Booth Details */}
            {selectedBooth && (
              <div className="card shadow-lg p-4 bg-gradient-to-br from-primary-50 to-blue-50">
                <h3 className="font-semibold text-gray-900 mb-3">Selected Booth</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">Name</p>
                    <p className="text-gray-900">{selectedBooth.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">ID</p>
                    <p className="font-mono text-primary-700">{selectedBooth.boothId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Address</p>
                    <p className="text-gray-900 text-xs">{selectedBooth.address}</p>
                  </div>
                  {directions && (
                    <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded">
                      <p className="text-emerald-700 font-semibold">
                        {directions.distance} km away
                      </p>
                      <p className="text-xs text-gray-600">
                        Est. {directions.estimatedTime}m drive
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleGetDirections}
                      className="flex-1 bg-primary-600 text-white py-2 text-xs font-semibold rounded hover:bg-primary-700 transition-all"
                    >
                      Get Directions
                    </button>
                    <button
                      onClick={handleOpenInMaps}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 text-xs font-semibold rounded hover:bg-gray-300 transition-all"
                    >
                      Open Maps
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default PollingBoothFinder;
