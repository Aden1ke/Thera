"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from '../../components/ui/button';
import { Progress } from "../../components/ui/progress"
import { MessageCircle, Moon, Sun, Heart, AlertTriangle } from "lucide-react"
import ChatApp from '../chatApp/ChatApp';
import SoulGarden from "../soul-garden"
import HealingRituals from "../healing-rituals"
import { useTheme } from "next-themes"

export default function HomePage() {
  // State Management
  const [showChat, setShowChat] = useState(false)          // Toggles chat interface
  const [currentView, setCurrentView] = useState("home")   // Controls current view (home/garden/rituals)
  const [emotionalState, setEmotionalState] = useState({   // Tracks user's emotional metrics
    wellness: 65,
    distress: 20,
  })
  const [isFirstVisit, setIsFirstVisit] = useState(true)   // First-time user experience flag
  const { theme, setTheme } = useTheme()                   // Theme management (dark/light mode)

  // First Visit Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFirstVisit(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Chat Handlers
  const handleShareDay = () => {
    setShowChat(true)
  }

  const handleEmotionalUpdate = (wellness: number, distress: number) => {
    setEmotionalState({ wellness, distress })
  }

  // Chat Interface View
  if (showChat) {
    return <ChatApp onEmotionalUpdate={handleEmotionalUpdate} onBack={() => setShowChat(false)} />
  }

  // Soul Garden View (Plant-based emotional visualization)
  if (currentView === "garden") {
    return (
      <div className="min-h-screen relative">
        {/* Themed background with overlay */}
        <div className="fixed inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                theme === "dark" ? "url('/dense-forest.jpg')" : "url('/bright-waterfall.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
        </div>

        {/* Garden Component */}
        <div className="relative z-10">
          <SoulGarden woundSeeds={[]} onBack={() => setCurrentView("home")} emotionalState={emotionalState} />
        </div>
      </div>
    )
  }

  // Healing Rituals View (Therapeutic activities)
  if (currentView === "rituals") {
    return (
      <div className="min-h-screen relative">
        {/* Themed background with overlay */}
        <div className="fixed inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                theme === "dark"
                  ? "url('/bioluminescent-waterfall.jpg')"
                  : "url('/bright-waterfall.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />
        </div>

        {/* Rituals Component */}
        <div className="relative z-10">
          <HealingRituals onBack={() => setCurrentView("home")} />
        </div>
      </div>
    )
  }

  // MAIN HOME VIEW -------------------------------------------------
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dynamic Background Image */}
      {/* Changes based on active theme with overlay */}
      <div className="fixed inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-1000"
          style={{
            backgroundImage:
              theme === "dark" ? "url('/dark-forest-plant.jpg')" : "url('/bright-waterfall.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-black/20 dark:bg-black/30" />
      </div>

      {/* Theme Toggle Button */}
      {/* Animated button for dark/light mode switching */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-6 right-6 z-50 p-3 bg-white/20 dark:bg-black/30 backdrop-blur-sm rounded-full border border-white/30 dark:border-gray-600 hover:bg-white/30 dark:hover:bg-black/40 transition-all duration-300"
      >
        {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-purple-600" />}
      </motion.button>

      {/* View Navigation */}
      {/* Animated buttons for switching between app sections */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed top-6 left-6 z-50 flex gap-2"
      >
        {["home", "garden", "rituals"].map((view) => (
          <Button
            key={view}
            variant={currentView === view ? "default" : "ghost"}
            size="sm"
            className={`${
              currentView === view
                ? "bg-healing-teal/80 text-white"
                : "bg-white/20 dark:bg-black/20 text-white hover:bg-white/30 dark:hover:bg-black/30"
            } backdrop-blur-sm border border-white/30`}
            onClick={() => setCurrentView(view)}
          >
            {view === "home" && <Heart className="w-4 h-4 mr-2" />}
            {view === "garden" && "🌱"}
            {view === "rituals" && "🌙"}
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </Button>
        ))}
      </motion.div>

      {/* Emotional Progress Bars */}
      {/* Animated sidebar showing wellness and distress metrics */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5 }}
        className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40 space-y-6"
      >
        {/* Wellness Progress */}
        <div className="bg-white/20 dark:bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/30 dark:border-gray-600 min-w-[200px]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-healing-teal/20 flex items-center justify-center">
              <Heart className="w-4 h-4 text-healing-teal" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Soul Wellness</p>
              <p className="text-xs text-white/70">{emotionalState.wellness}%</p>
            </div>
          </div>
          <Progress value={emotionalState.wellness} className="h-2 bg-white/20" />
          <div className="mt-2 text-xs text-white/60">
            {emotionalState.wellness > 70
              ? "Flourishing 🌸"
              : emotionalState.wellness > 40
                ? "Growing 🌱"
                : "Needs care 💜"}
          </div>
        </div>

        {/* Distress Progress */}
        <div className="bg-white/20 dark:bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/30 dark:border-gray-600 min-w-[200px]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-crisis-red/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-crisis-red" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Distress Level</p>
              <p className="text-xs text-white/70">{emotionalState.distress}%</p>
            </div>
          </div>
          <Progress value={emotionalState.distress} className="h-2 bg-white/20" />
          <div className="mt-2 text-xs text-white/60">
            {emotionalState.distress < 30
              ? "Peaceful 🕊️"
              : emotionalState.distress < 60
                ? "Manageable 🌧️"
                : "Storm passing ⛈️"}
          </div>
        </div>
      </motion.div>

      {/* Central Content Area */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Animated Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center mb-12 max-w-2xl"
        >
          {/* Animated Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mb-8"
          >
            <div className="relative mx-auto w-24 h-24">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-healing-teal via-growth-lime to-serene-sage dark:from-healing-teal-dark dark:via-ember-moss dark:to-soul-green rounded-full"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute inset-2 bg-white/30 dark:bg-black/20 rounded-full flex items-center justify-center"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                <span className="text-3xl">🌿</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg"
          >
            Welcome to Thera
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="text-xl md:text-2xl text-white/90 mb-2 font-medium drop-shadow-md"
          >
            Your Soul Companion
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="text-lg text-white/80 leading-relaxed drop-shadow-md"
          >
            A safe space where your feelings are heard, your patterns are understood,
            and your healing journey blooms like the forest around you.
          </motion.p>
        </motion.div>

        {/* Main CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="text-center"
        >
          <Button
            onClick={handleShareDay}
            size="lg"
            className="bg-gradient-to-r from-healing-teal to-growth-lime hover:from-healing-teal-dark hover:to-growth-lime/90 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg"
          >
            <MessageCircle className="w-6 h-6 mr-3" />
            Share Your Day With Me
          </Button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.6 }}
            className="mt-4 text-sm text-white/70 drop-shadow-md"
          >
            Thera is here to listen, understand, and grow with you 🌸
          </motion.p>
        </motion.div>
      </div>

      {/* First Visit Animation */}
      {/* Special animation shown only on initial visit */}
      {isFirstVisit && (
        <motion.div
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="text-6xl origin-bottom"
          >
            🌱
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="text-center mt-2"
          >
            <p className="text-sm text-white font-medium drop-shadow-md">Your journey begins...</p>
          </motion.div>
        </motion.div>
      )}

      {/* Ambient Floating Particles */}
      {/* Background animation elements for visual interest */}
      <div className="fixed inset-0 pointer-events-none z-5">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  )
}
