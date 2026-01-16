import axios from "axios";
import { API } from "../types";
import { getUserData } from "../userStore/userData";

const API_BASE_URL = API;

// Helper to safely set localStorage with quota handling
const safeSetLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.warn("LocalStorage full. Clearing old chat data...");
      // Clear old chat data to make space
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith("chat_")) keysToRemove.push(k);
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      // Try again
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (e2) {
        console.error("Still can't save to localStorage:", e2);
        return false;
      }
    }
    return false;
  }
};

export const chatStorageService = {

  async getSessions() {
    try {
      const token = getUserData()?.token;
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${API_BASE_URL}/chat`, { headers });
      if (!response.ok) throw new Error("Backend failed");
      return await response.json();
    } catch (error) {
      console.warn("Backend unavailable. Using LocalStorage fallback.");
      const sessions = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("chat_meta_")) {
          const sessionId = key.replace("chat_meta_", "");
          const meta = JSON.parse(localStorage.getItem(key) || "{}");

          sessions.push({
            sessionId,
            title: meta.title || "New Chat",
            lastModified: meta.lastModified || Date.now(),
          });
        }
      }

      return sessions.sort((a, b) => b.lastModified - a.lastModified);
    }
  },

  async getHistory(sessionId) {
    if (sessionId === "new") return [];

    try {
      const token = getUserData()?.token;
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${API_BASE_URL}/chat/${sessionId}`, { headers });
      if (response.status === 404) return [];

      if (!response.ok) throw new Error("Backend response not ok");

      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error("Error fetching history:", error);
      const local = localStorage.getItem(`chat_history_${sessionId}`);
      return local ? JSON.parse(local) : [];
    }
  },

  async saveMessage(sessionId, message, title) {
    try {
      const token = getUserData()?.token;
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const response = await axios.post(`${API_BASE_URL}/chat/${sessionId}/message`, { message, title }, {
        headers: headers
      });

      if (response.status !== 200) throw new Error("Backend save failed");
    } catch (error) {
      console.warn("Backend save failed, using LocalStorage fallback:", error.message);

      // --- LocalStorage fallback with quota handling ---
      const historyKey = `chat_history_${sessionId}`;
      const metaKey = `chat_meta_${sessionId}`;

      const localHistory = localStorage.getItem(historyKey);
      let messages = localHistory ? JSON.parse(localHistory) : [];

      // Avoid duplicates
      if (!messages.find((m) => m.id === message.id)) {
        messages.push(message);
        safeSetLocalStorage(historyKey, JSON.stringify(messages));

        const existingMeta = JSON.parse(localStorage.getItem(metaKey) || "{}");

        const meta = {
          title: title || existingMeta.title || "New Chat",
          lastModified: Date.now(),
        };

        safeSetLocalStorage(metaKey, JSON.stringify(meta));
      }
    }
  },

  async deleteSession(sessionId) {
    try {
      const token = getUserData()?.token;
      const response = await axios.delete(`${API_BASE_URL}/chat/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting session:", error);
      localStorage.removeItem(`chat_history_${sessionId}`);
      localStorage.removeItem(`chat_meta_${sessionId}`);
    }
  },

  async createSession() {
    return (
      Date.now().toString(36) +
      Math.random().toString(36).substr(2)
    );
  },
};