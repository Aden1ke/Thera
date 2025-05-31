// /data/data/com.termux/files/home/Thera/frontend/src/components/healing-rituals.js
"use client"

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./../components/ui/card";
import { Button } from './../components/ui/button';
//import { Progress } from "./../components/ui/progress";
import { Textarea } from './../components/ui/textarea';
import { Moon, Sun, Heart, Feather, Sparkles, ArrowLeft, Play } from "lucide-react";


const rituals = [
  {
    id: "breathing",
    name: "Guided Breathing",
    icon: <Moon className="w-6 h-6" />,
    description: "Deep breathing exercises to calm your mind",
    action: "Follow along with guided breathing",
    color: "from-indigo-400 to-purple-600",
    youtubeQuery: "guided breathing meditation calm anxiety",
  },
  {
    id: "meditation",
    name: "Mindfulness Meditation",
    icon: <Sparkles className="w-6 h-6" />,
    description: "Gentle meditation to center your thoughts",
    action: "Find peace in mindful awareness",
    color: "from-purple-400 to-pink-600",
    youtubeQuery: "mindfulness meditation stress relief",
  },
  {
    id: "release",
    name: "Emotional Release",
    icon: <Feather className="w-6 h-6" />,
    description: "Let go of what no longer serves you",
    action: "What would you like to release today?",
    color: "from-blue-400 to-cyan-600",
    youtubeQuery: "emotional release meditation letting go",
  },
  {
    id: "gratitude",
    name: "Gratitude Practice",
    icon: <Heart className="w-6 h-6" />,
    description: "Cultivate appreciation and joy",
    action: "Reflect on what brings you gratitude",
    color: "from-pink-400 to-rose-600",
    youtubeQuery: "gratitude meditation positive thinking",
  },
  {
    id: "energy",
    name: "Energy Healing",
    icon: <Sun className="w-6 h-6" />,
    description: "Restore your inner light and vitality",
    action: "Gather healing energy",
    color: "from-yellow-400 to-orange-600",
    youtubeQuery: "energy healing meditation chakra",
  },
]

export default function HealingRituals({ onBack }) {
  const [activeRitual, setActiveRitual] = useState(null)
  const [ritualInput, setRitualInput] = useState("")
  const [ritualComplete, setRitualComplete] = useState(false)
  const [videos, setVideos] = useState([])
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [isVideoLoading, setIsVideoLoading] = useState(false)
  const [videoError, setVideoError] = useState("")

  // YouTube API integration
  const searchYouTubeVideos = async (query) => {
    setIsVideoLoading(true)
    setVideoError("")

    try {
      // Call our API route instead of mocking data
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setVideos(data.videos)
    } catch (error) {
      setVideoError("Unable to load videos. Please try again.")
      console.error("YouTube API error:", error)
    } finally {
      setIsVideoLoading(false)
    }
  }

  const startRitual = async (ritualId) => {
    setActiveRitual(ritualId)
    setRitualInput("")
    setRitualComplete(false)
    setSelectedVideo(null)

    const ritual = rituals.find((r) => r.id === ritualId)
    if (ritual?.youtubeQuery) {
      await searchYouTubeVideos(ritual.youtubeQuery)
    }
  }

  const completeRitual = () => {
    setRitualComplete(true)
    setTimeout(() => {
      setActiveRitual(null)
      setRitualComplete(false)
      setVideos([])
      setSelectedVideo(null)
    }, 3000)
  }

  const selectVideo = (video) => {
    setSelectedVideo(video)
  }

  const getRitualContent = (ritual) => {
    if (ritualComplete) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white space-y-4"
        >
          <div className="text-6xl">✨</div>
          <h3 className="text-2xl font-bold">Ritual Complete</h3>
          <p className="text-white/90">Your soul feels lighter. Well done. 🌸</p>
        </motion.div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Video Selection */}
        {videos.length > 0 && !selectedVideo && (
          <div className="space-y-4">
            <h3 className="text-white text-lg font-medium text-center">Choose a guided session:</h3>
            {isVideoLoading ? (
              <div className="text-center text-white/80">Loading videos...</div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {videos.map((video) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 rounded-lg p-3 cursor-pointer hover:bg-white/20 transition-colors"
                    onClick={() => selectVideo(video)}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        className="w-16 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white text-sm font-medium truncate">{video.title}</h4>
                        <p className="text-white/70 text-xs">
                          {video.channel} • {video.duration}
                        </p>
                      </div>
                      <Play className="w-5 h-5 text-white/80" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected Video Player */}
        {selectedVideo && (
          <div className="space-y-4">
            <div className="bg-black/50 rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="200"
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full"
              ></iframe>
            </div>
            <div className="text-center">
              <h4 className="text-white font-medium mb-2">{selectedVideo.title}</h4>
              <Button
                onClick={() => setSelectedVideo(null)}
                variant="outline"
                size="sm"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 mr-2"
              >
                Choose Different Video
              </Button>
              <Button
                onClick={completeRitual}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
              >
                Complete Ritual
              </Button>
            </div>
          </div>
        )}

        {/* Ritual-specific content when no video is selected */}
        {!selectedVideo && videos.length === 0 && !isVideoLoading && (
          <>
            {ritual.id === "release" && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl mb-4">🕊️</div>
                  <p className="text-white/90 mb-4">Speak what weighs on your heart</p>
                </div>
                <Textarea
                  placeholder="I release..."
                  value={ritualInput}
                  onChange={(e) => setRitualInput(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <div className="text-center">
                  <Button
                    onClick={completeRitual}
                    disabled={!ritualInput.trim()}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                  >
                    Release and Let Go
                  </Button>
                </div>
              </div>
            )}

            {ritual.id === "gratitude" && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl mb-4">💖</div>
                  <p className="text-white/90 mb-4">What fills your heart with gratitude?</p>
                </div>
                <Textarea
                  placeholder="I am grateful for..."
                  value={ritualInput}
                  onChange={(e) => setRitualInput(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <div className="text-center">
                  <Button
                    onClick={completeRitual}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                  >
                    Embrace Gratitude
                  </Button>
                </div>
              </div>
            )}

            {(ritual.id === "breathing" || ritual.id === "meditation" || ritual.id === "energy") && (
              <div className="text-center space-y-6">
                <div className="text-4xl">🧘‍♀️</div>
                <p className="text-white/90">Loading guided sessions for you...</p>
                <Button
                  onClick={completeRitual}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                >
                  Continue Without Video
                </Button>
              </div>
            )}
          </>
        )}

        {videoError && (
          <div className="text-center space-y-4">
            <div className="text-red-300 text-sm">{videoError}</div>
            <Button
              onClick={completeRitual}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
            >
              Continue Ritual
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      {onBack && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-green-800 dark:text-green-300 hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </motion.div>
      )}

      <div className="space-y-6 max-w-6xl mx-auto">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200 text-center">🌙 Healing Rituals</CardTitle>
            <p className="text-green-700 dark:text-green-400 text-center text-sm">
              Sacred practices with guided videos to soothe your soul
            </p>
          </CardHeader>
        </Card>

        <AnimatePresence>
          {!activeRitual ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {rituals.map((ritual) => (
                <motion.div key={ritual.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card
                    className="bg-white/10 backdrop-blur-sm border-white/20 cursor-pointer hover:bg-white/20 transition-all duration-300"
                    onClick={() => startRitual(ritual.id)}
                  >
                    <CardContent className="p-6 text-center space-y-4">
                      <div
                        className={`w-16 h-16 rounded-full bg-gradient-to-br ${ritual.color} flex items-center justify-center text-white mx-auto`}
                      >
                        {ritual.icon}
                      </div>
                      <h3 className="font-semibold text-green-800 dark:text-green-200">{ritual.name}</h3>
                      <p className="text-sm text-green-700 dark:text-green-400">{ritual.description}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 dark:border-gray-500/30 text-green-800 dark:text-green-300 hover:bg-white/20 dark:hover:bg-gray-700/30"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Begin Ritual
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setActiveRitual(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-gradient-to-br ${rituals.find((r) => r.id === activeRitual)?.color} p-6 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
              >
                {getRitualContent(rituals.find((r) => r.id === activeRitual))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

