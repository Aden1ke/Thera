// In useEmotionalStateTracking.js
import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'; //

export function useEmotionalStateTracking(isAuthenticated) {
  const [emotionalState, setEmotionalState] = useState({
    wellness: 50, // Neutral default
    distress: 50,  // Neutral default
  });

  // Function to calculate average emotional state from recent journals
  const calculateAverageEmotionalState = useCallback(async () => {
    if (!isAuthenticated) {
      setEmotionalState({ wellness: 50, distress: 50 }); // Reset to neutral if not authenticated
      return;
    }

    try {
      const authData = JSON.parse(localStorage.getItem("thera_auth"));
      const token = authData?.token;
      if (!token) {
        console.warn("Authentication token not found for emotional state calculation.");
        setEmotionalState({ wellness: 50, distress: 50 }); // Reset to neutral if not authenticated
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/journals`, { //
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch journal entries for emotional state calculation:", response.status, await response.text());
        setEmotionalState({ wellness: 50, distress: 50 }); // Fallback on error
        return;
      }

      const data = await response.json();
      const allEntries = data.data || []; // Assuming 'data' contains a 'data' array

      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3); // Calculate date 3 days ago

      // Filter entries that were created within the last 3 days
      const relevantEntries = allEntries.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate >= threeDaysAgo;
      });

      if (relevantEntries.length > 0) {
        const totalDistress = relevantEntries.reduce((sum, entry) => sum + (entry.distressScore || 0), 0);
        const avgDistress = totalDistress / relevantEntries.length;

        // Scale distress from 0-10 to 0-100
        const scaledDistress = (avgDistress / 10) * 100; // Assuming distressScore is 0-10
        const scaledWellness = 100 - scaledDistress;

        setEmotionalState({
          wellness: Math.max(0, Math.min(100, scaledWellness)), // Ensure values are within 0-100
          distress: Math.max(0, Math.min(100, scaledDistress)), // Ensure values are within 0-100
        });
      } else {
        // If no recent entries, default to a neutral state
        setEmotionalState({ wellness: 50, distress: 50 });
      }

    } catch (error) {
      console.error("Error calculating average emotional state:", error);
      setEmotionalState({ wellness: 50, distress: 50 }); // Fallback on error
    }
  }, [isAuthenticated]); // Dependency on isAuthenticated

  // NEW: Function to immediately set emotional state to critical distress
  const setCriticalDistress = useCallback(() => {
    setEmotionalState({ wellness: 0, distress: 100 });
  }, []);

  // Initial fetch and re-fetch if isAuthenticated changes
  useEffect(() => {
    if (isAuthenticated) {
      calculateAverageEmotionalState();
    }
    // Optionally, set an interval to re-calculate every few hours or daily
    const interval = setInterval(() => {
        if (isAuthenticated) {
            console.log("Recalculating emotional state from recent entries...");
            calculateAverageEmotionalState();
        }
    }, 12 * 60 * 60 * 1000); // Recalculate every 12 hours (adjust as needed)

    return () => clearInterval(interval); // Clean up on unmount
  }, [isAuthenticated, calculateAverageEmotionalState]);

  // Expose the state and the setter/re-calculation function
  return { emotionalState, setEmotionalState, calculateAverageEmotionalState, setCriticalDistress };
}
