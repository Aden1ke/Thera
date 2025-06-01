"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "./../components/ui/card"
import { Button } from "./../components/ui/button"
import { Input } from "./../components/ui/input"
import { ArrowLeft, Search, Calendar, MessageCircle, Heart, Filter, AlertTriangle } from "lucide-react" // Added AlertTriangle

// Helper to get the API URL (especially useful if you deploy)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function JournalHistory({ onBack }) {
  const [entries, setEntries] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEmotion, setSelectedEmotion] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null) // For API errors

  useEffect(() => {
    const fetchEntries = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Retrieve token from localStorage (or your auth context/store)
        const authData = JSON.parse(localStorage.getItem("thera_auth"));
        const token = authData?.token;

        if (!token) {
          setError("Authentication token not found. Please log in.");
          setIsLoading(false);
          setEntries([]); // Clear entries if not authenticated
          return;
        }

        const response = await fetch(`${API_URL}/journals`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error: ${response.status}`);
        }

        const data = await response.json();

        // Map backend data to frontend structure
        const mappedEntries = data.data.map(entry => ({
          id: entry._id,
          date: entry.createdAt, // Already a date string, can be formatted later
          preview: entry.entry,
          emotions: entry.emotions || [],
          // wellness: 100 - (entry.distressScore || 0), // Example derivation for wellness
          distress: entry.distressScore || 0,
          }));
        setEntries(mappedEntries);
      } catch (err) {
        console.error("Failed to fetch journal entries:", err);
        setError(err.message || "Could not fetch journal entries.");
        setEntries([]); // Clear entries on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, []); // Empty dependency array means this runs once on component mount

  const allEmotions = Array.from(new Set(entries.flatMap((entry) => entry.emotions))).filter(Boolean);

  const filteredEntries = entries.filter((entry) => {
    const entryPreviewLower = entry.preview?.toLowerCase() || "";
    const entryEmotionsLower = entry.emotions.map(e => e.toLowerCase());
    const searchTermLower = searchTerm.toLowerCase();

    const matchesSearch =
      entryPreviewLower.includes(searchTermLower) ||
      entryEmotionsLower.some((emotion) => emotion.includes(searchTermLower));
    const matchesEmotion = !selectedEmotion || entryEmotionsLower.includes(selectedEmotion.toLowerCase());
    return matchesSearch && matchesEmotion;
  });

  const getEmotionColor = (emotion) => {
       const colors = {
      joy: "bg-yellow-400/20 text-yellow-600 border-yellow-400/30 dark:text-yellow-400",
      gratitude: "bg-green-400/20 text-green-600 border-green-400/30 dark:text-green-400",
      love: "bg-pink-400/20 text-pink-600 border-pink-400/30 dark:text-pink-400",
      hope: "bg-blue-400/20 text-blue-600 border-blue-400/30 dark:text-blue-400",
      anxiety: "bg-orange-400/20 text-orange-600 border-orange-400/30 dark:text-orange-400",
      sadness: "bg-indigo-400/20 text-indigo-600 border-indigo-400/30 dark:text-indigo-400",
      loneliness: "bg-purple-400/20 text-purple-600 border-purple-400/30 dark:text-purple-400",
      comfort: "bg-teal-400/20 text-teal-600 border-teal-400/30 dark:text-teal-400",
    };
    return colors[emotion?.toLowerCase()] || "bg-gray-400/20 text-gray-600 border-gray-400/30 dark:text-gray-400";
  };

    const getDistressIndicator = (distress) => {
    if (distress === undefined || distress === null) return { color: "text-gray-500 dark:text-gray-400", emoji: "❓" };
    if (distress <= 2) return { color: "text-green-600 dark:text-green-400", emoji: "🌸" }; // Low distress
    if (distress <= 5) return { color: "text-yellow-600 dark:text-yellow-400", emoji: "🌱" }; // Moderate
    if (distress <= 7) return { color: "text-orange-500 dark:text-orange-400", emoji: "🌧️" }; // High
    return { color: "text-red-600 dark:text-red-400", emoji: "⛈️" }; // Very High
  };


  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      {onBack && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-green-800 dark:text-green-300 hover:bg-white/20 dark:hover:bg-black/30 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </motion.div>
      )}

      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Page Header */}
        <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-sm border-white/20 dark:border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200 text-center flex items-center justify-center gap-2">
              <MessageCircle className="w-6 h-6" />
              Journal History
            </CardTitle>
            <p className="text-green-700 dark:text-green-400 text-center text-sm">
              Your conversations with Thera, captured and remembered
            </p>
          </CardHeader>
        </Card>

        {/* Search and Filter */}
        <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-sm border-white/20 dark:border-gray-600/30">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600 dark:text-green-400" />
                <Input
                  placeholder="Search your journal entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 dark:bg-black/20 border-white/20 dark:border-gray-600/50 text-green-800 dark:text-green-200 placeholder:text-green-600/50 dark:placeholder:text-green-500/50"
                />
              </div>

              {/* Emotion Filter */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                  <Filter className="w-4 h-4" />
                  Filter by emotion:
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedEmotion === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedEmotion(null)}
                    className="text-xs bg-green-700/80 dark:bg-green-800/80 border-white/20 dark:border-gray-600/50 text-white hover:bg-green-800 dark:hover:bg-green-900"
                  >
                    All
                  </Button>
                  {allEmotions.map((emotion) => (
                    <Button
                      key={emotion}
                      variant={selectedEmotion === emotion ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedEmotion(emotion === selectedEmotion ? null : emotion)}
                      className={`text-xs capitalize ${getEmotionColor(emotion)} hover:opacity-80`}
                    >
                      {emotion}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Journal Entries Display */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-green-700 dark:text-green-400">
              Loading your journal entries...
            </div>
          ) : error ? (
            <Card className="bg-red-500/10 dark:bg-red-900/20 backdrop-blur-sm border-red-500/20 dark:border-red-600/30">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-red-600/80 dark:text-red-500/80 mx-auto mb-4" />
                <p className="text-red-700 dark:text-red-300 font-semibold">Error loading entries</p>
                <p className="text-red-600 dark:text-red-400 text-sm mt-2">{error}</p>
              </CardContent>
            </Card>
          ) : filteredEntries.length === 0 ? (
            <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-sm border-white/20 dark:border-gray-600/30">
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-green-600/50 dark:text-green-500/50 mx-auto mb-4" />
                <p className="text-green-700 dark:text-green-400">
                  {searchTerm || selectedEmotion ? "No entries match your search" : "No journal entries yet."}
                </p>
                <p className="text-green-600 dark:text-green-500 text-sm mt-2">
                  {searchTerm || selectedEmotion
                    ? "Try adjusting your filters or search term."
                    : "Start chatting with Ember to create your first journal entry."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence>
              {filteredEntries.map((entry, index) => {
                const indicator = getDistressIndicator(entry.distress); // Using distress for the indicator
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-sm border-white/20 dark:border-gray-600/30 hover:bg-white/15 dark:hover:bg-black/25 transition-all duration-300 cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <div>
                              <p className="font-medium text-green-800 dark:text-green-200">
                                {new Date(entry.date).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                              </div>
                          </div>
                          <div className={`flex items-center gap-1 ${indicator.color}`}>
                            <span className="text-lg">{indicator.emoji}</span>
                            <Heart className="w-4 h-4" /> {/* Or another relevant icon */}
                          </div>
                        </div>

                        <p className="text-green-700 dark:text-green-300 mb-4 line-clamp-2">{entry.preview}</p>

                        <div className="flex flex-wrap gap-2">
                          {entry.emotions.map((emotion) => (
                            <span
                              key={emotion}
                              className={`px-2 py-1 text-xs rounded-full border capitalize ${getEmotionColor(emotion)}`}
                            >
                              {emotion}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
