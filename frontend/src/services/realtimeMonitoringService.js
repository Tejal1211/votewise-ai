import {
  collection,
  query,
  onSnapshot,
  orderBy,
  where,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Real-Time Monitoring Service
 * Manages live dashboard data with Firebase listeners
 */

// Citizen Dashboard Listeners
export const subscribeToUserStatus = (userId, callback) => {
  try {
    const docRef = doc(db, "userStatus", userId);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({
          ...snapshot.data(),
          updatedAt: snapshot.data().updatedAt?.toDate(),
        });
      }
    });
  } catch (error) {
    console.error("Error subscribing to user status:", error);
    return () => {};
  }
};

export const subscribeToLiveBoothStatus = (boothId, callback) => {
  try {
    return onSnapshot(
      query(
        collection(db, "boothStatus"),
        where("boothId", "==", boothId),
        orderBy("timestamp", "desc"),
        limit(1)
      ),
      (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          callback({
            ...data,
            timestamp: data.timestamp?.toDate(),
          });
        }
      }
    );
  } catch (error) {
    console.error("Error subscribing to booth status:", error);
    return () => {};
  }
};

export const subscribeToNotifications = (userId, callback) => {
  try {
    return onSnapshot(
      query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        where("read", "==", false),
        orderBy("createdAt", "desc")
      ),
      (snapshot) => {
        const notifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        }));
        callback(notifications);
      }
    );
  } catch (error) {
    console.error("Error subscribing to notifications:", error);
    return () => {};
  }
};

// Admin Dashboard Listeners
export const subscribeToBoothHeatmap = (regionId, callback) => {
  try {
    return onSnapshot(
      query(
        collection(db, "boothMetrics"),
        where("regionId", "==", regionId),
        orderBy("crowdLevel", "desc")
      ),
      (snapshot) => {
        const booths = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate(),
        }));
        callback(booths);
      }
    );
  } catch (error) {
    console.error("Error subscribing to booth heatmap:", error);
    return () => {};
  }
};

export const subscribeToRegionTurnout = (regionId, callback) => {
  try {
    const docRef = doc(db, "regionStats", regionId);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({
          ...snapshot.data(),
          updatedAt: snapshot.data().updatedAt?.toDate(),
        });
      }
    });
  } catch (error) {
    console.error("Error subscribing to region turnout:", error);
    return () => {};
  }
};

export const subscribeToSystemHealth = (callback) => {
  try {
    const docRef = doc(db, "system", "health");
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({
          ...snapshot.data(),
          updatedAt: snapshot.data().updatedAt?.toDate(),
        });
      }
    });
  } catch (error) {
    console.error("Error subscribing to system health:", error);
    return () => {};
  }
};

export const subscribeToSecurityAlerts = (callback) => {
  try {
    return onSnapshot(
      query(
        collection(db, "securityAlerts"),
        where("resolved", "==", false),
        orderBy("timestamp", "desc"),
        limit(100)
      ),
      (snapshot) => {
        const alerts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate(),
        }));
        callback(alerts);
      }
    );
  } catch (error) {
    console.error("Error subscribing to security alerts:", error);
    return () => {};
  }
};

export const subscribeToDuplicateFaceAttempts = (callback) => {
  try {
    return onSnapshot(
      query(
        collection(db, "faceMatchAttempts"),
        where("duplicate", "==", true),
        where("resolved", "==", false),
        orderBy("timestamp", "desc")
      ),
      (snapshot) => {
        const attempts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate(),
        }));
        callback(attempts);
      }
    );
  } catch (error) {
    console.error("Error subscribing to duplicate face attempts:", error);
    return () => {};
  }
};

export const subscribeLiveUserCount = (callback) => {
  try {
    const docRef = doc(db, "system", "liveMetrics");
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      }
    });
  } catch (error) {
    console.error("Error subscribing to live user count:", error);
    return () => {};
  }
};

// Update user status
export const updateUserStatus = async (userId, status) => {
  try {
    const docRef = doc(db, "userStatus", userId);
    await updateDoc(docRef, {
      ...status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
};

// Add notification
export const addNotification = async (userId, title, message, type = "info") => {
  try {
    await addDoc(collection(db, "notifications"), {
      userId,
      title,
      message,
      type, // 'info', 'success', 'warning', 'error'
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding notification:", error);
    throw error;
  }
};

// Log security event
export const logSecurityEvent = async (type, details, severity = "info") => {
  try {
    await addDoc(collection(db, "securityAlerts"), {
      type,
      details,
      severity, // 'info', 'warning', 'critical'
      resolved: false,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error logging security event:", error);
    throw error;
  }
};

// Record booth metrics
export const recordBoothMetrics = async (boothId, regionId, crowdLevel, waitTime) => {
  try {
    await addDoc(collection(db, "boothMetrics"), {
      boothId,
      regionId,
      crowdLevel, // 0-100
      waitTime, // minutes
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error recording booth metrics:", error);
    throw error;
  }
};
