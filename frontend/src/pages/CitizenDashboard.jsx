import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import {
  subscribeToUserStatus,
  subscribeToNotifications,
  updateUserStatus,
  addNotification,
} from "../services/realtimeMonitoringService";
import {
  getNearestBooths,
  getBestTimeToVote,
  calculateCrowdColor,
} from "../services/boothService";

const API_URL = import.meta.env.VITE_API_URL || "";

const CitizenDashboard = () => {
  const { user } = useAuth();
  const { language } = useLang();
  const [userStatus, setUserStatus] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [nearbyBooths, setNearbyBooths] = useState([]);
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);

  // Subscribe to user status
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserStatus(user.uid, (status) => {
      setUserStatus(status);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Subscribe to notifications
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToNotifications(user.uid, (notifs) => {
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, [user]);

  // Get user location and nearby booths
  useEffect(() => {
    if (!user) return;

    const getLocation = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              setLocation({ lat: latitude, lng: longitude });

              const booths = await getNearestBooths(latitude, longitude, 5);
              setNearbyBooths(booths.booths || []);
            },
            (error) => {
              console.warn("Location access denied:", error);
              // Use default Delhi location
              setLocation({ lat: 28.7041, lng: 77.1025 });
            }
          );
        }
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };

    getLocation();
  }, [user]);

  const handleBoothSelect = async (booth) => {
    setSelectedBooth(booth);
    try {
      const bestTime = await getBestTimeToVote(booth.boothId);
      setSelectedBooth((prev) => ({ ...prev, bestTime }));
    } catch (error) {
      console.error("Error fetching best time:", error);
    }
  };

  const countdownDays = () => {
    // Assuming election date (this would come from backend in production)
    const electionDate = new Date("2026-06-01");
    const today = new Date();
    const diff = electionDate - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen mesh-bg pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen mesh-bg pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title mb-2">📊 Citizen Dashboard</h1>
          <p className="text-gray-600">Live voting status and polling booth information</p>
        </div>

        {/* Countdown Timer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card shadow-lg p-6 bg-gradient-to-br from-primary-50 to-blue-50 border-l-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Days Until Election</p>
                <p className="text-4xl font-bold text-primary-700">{countdownDays()}</p>
              </div>
              <span className="text-5xl">📅</span>
            </div>
          </div>

          <div className="card shadow-lg p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Registration Status</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {userStatus?.status === "registered" ? "✅ Registered" : "⏳ Pending"}
                </p>
              </div>
              <span className="text-5xl">🗳️</span>
            </div>
          </div>

          <div className="card shadow-lg p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Booth Queue Status</p>
                <p className="text-2xl font-bold text-amber-700">
                  {nearbyBooths.length > 0
                    ? `${Math.round(
                        nearbyBooths.reduce((sum, b) => sum + b.crowdLevel, 0) /
                          nearbyBooths.length
                      )}% Avg`
                    : "N/A"}
                </p>
              </div>
              <span className="text-5xl">👥</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Nearby Booths */}
          <div className="lg:col-span-2">
            <div className="card shadow-lg p-6">
              <h2 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                📍 Nearby Polling Booths
              </h2>

              {nearbyBooths.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {nearbyBooths.map((booth) => (
                    <button
                      key={booth.boothId}
                      onClick={() => handleBoothSelect(booth)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedBooth?.boothId === booth.boothId
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-primary-300 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{booth.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{booth.address}</p>
                          <div className="flex gap-4 text-xs">
                            <span className="flex items-center gap-1">
                              👥 {booth.currentVoters}/{booth.capacity}
                            </span>
                            <span className="flex items-center gap-1">⏱️ {booth.waitTime}m wait</span>
                            <span
                              className="px-2 py-1 rounded text-white font-semibold"
                              style={{ backgroundColor: calculateCrowdColor(booth.crowdLevel) }}
                            >
                              {booth.crowdLevel}% crowd
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No booths found nearby. Check location permissions.</p>
                </div>
              )}
            </div>
          </div>

          {/* Selected Booth Details & Notifications */}
          <div className="space-y-6">
            {/* Selected Booth Info */}
            {selectedBooth && (
              <div className="card shadow-lg p-6 bg-gradient-to-br from-primary-50 to-blue-50">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">📌 Selected Booth</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">Name</p>
                    <p className="text-gray-900">{selectedBooth.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Booth ID</p>
                    <p className="font-mono text-primary-700">{selectedBooth.boothId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Hours</p>
                    <p className="text-gray-900">
                      {selectedBooth.openTime} - {selectedBooth.closeTime}
                    </p>
                  </div>
                  {selectedBooth.bestTime && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
                      <p className="text-gray-600 font-medium mb-1">Best Time to Vote</p>
                      <p className="text-emerald-700 font-semibold">
                        {selectedBooth.bestTime.suggestedTime}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Est. wait: {selectedBooth.bestTime.estimatedWaitTime} min
                      </p>
                    </div>
                  )}
                  <button className="w-full mt-4 btn-primary py-2 text-sm">
                    Get Directions 🗺️
                  </button>
                </div>
              </div>
            )}

            {/* Notifications */}
            <div className="card shadow-lg p-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                🔔 Notifications ({notifications.length})
              </h3>
              {notifications.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        notif.type === "success"
                          ? "bg-emerald-50 border-emerald-500"
                          : notif.type === "warning"
                          ? "bg-amber-50 border-amber-500"
                          : "bg-blue-50 border-blue-500"
                      }`}
                    >
                      <p className="font-semibold text-sm text-gray-900">{notif.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No new notifications</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CitizenDashboard;
