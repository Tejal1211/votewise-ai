import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
  doc,
  deleteDoc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Chat History Service
 * Manages persistent chat history in Firestore
 */

export const saveChatMessage = async (userId, message, role, language = "en") => {
  try {
    const docRef = await addDoc(collection(db, "chatHistory"), {
      userId,
      message,
      role,
      language,
      timestamp: new Date(),
      archived: false,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving chat message:", error);
    throw error;
  }
};

export const getChatHistory = async (userId, limit_num = 50) => {
  try {
    const q = query(
      collection(db, "chatHistory"),
      where("userId", "==", userId),
      where("archived", "==", false),
      orderBy("timestamp", "asc"),
      limit(limit_num)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate(),
    }));
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
};

export const subscribeToUserChatHistory = (userId, callback, limit_num = 50) => {
  try {
    const q = query(
      collection(db, "chatHistory"),
      where("userId", "==", userId),
      where("archived", "==", false),
      orderBy("timestamp", "asc"),
      limit(limit_num)
    );
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      }));
      callback(messages);
    });
  } catch (error) {
    console.error("Error subscribing to chat history:", error);
    return () => {};
  }
};

export const clearChatHistory = async (userId) => {
  try {
    const q = query(
      collection(db, "chatHistory"),
      where("userId", "==", userId),
      where("archived", "==", false)
    );
    const snapshot = await getDocs(q);
    const batch = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(batch);
  } catch (error) {
    console.error("Error clearing chat history:", error);
    throw error;
  }
};

export const archiveChatHistory = async (userId) => {
  try {
    const q = query(
      collection(db, "chatHistory"),
      where("userId", "==", userId),
      where("archived", "==", false)
    );
    const snapshot = await getDocs(q);
    const batch = snapshot.docs.map((doc) =>
      updateDoc(doc.ref, { archived: true })
    );
    await Promise.all(batch);
  } catch (error) {
    console.error("Error archiving chat history:", error);
    throw error;
  }
};

export const getUserChatSessions = async (userId) => {
  try {
    const q = query(
      collection(db, "chatSessions"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    }));
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return [];
  }
};

export const createChatSession = async (userId, title = "New Chat") => {
  try {
    const docRef = await addDoc(collection(db, "chatSessions"), {
      userId,
      title,
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating chat session:", error);
    throw error;
  }
};
