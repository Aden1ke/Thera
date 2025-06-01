// src/components/Home/HomePage.js
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from '../../components/ui/button';
import { MessageCircle, Moon, Sun, Heart, User, LogOut, BookOpen } from "lucide-react" // Added User, LogOut, BookOpen icons
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate
import ChatApp from '../chatApp/ChatApp';
import SoulGarden from "../soul-garden";
import HealingRituals from "../healing-rituals";
import ProfilePage from "../profile-page";
import JournalHistory from "../journal-history";
import { useTheme } from '../../components/theme-provider';

export default function HomePage() {
  const [showChat, setShowChat] = useState(false)
  const [currentView, setCurrentView] = useState("home")
  const [emotionalState, setEmotionalState] = useState({
    wellness: 65,
    distress: 20,
  })
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const { theme, setTheme } = useTheme();

  // --- NEW: Authentication State Management  to handle logou---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate for redirection

  useEffect(() => {
    // Check authentication status from localStorage on component mount
    const authData = localStorage.getItem("thera_auth");
    if (authData) {
      try {
        const parsedAuth = JSON.parse(authData);
        if (parsedAuth.isAuthenticated && parsedAuth.token) {
          setIsAuthenticated(true);
        } else {
          // If authData is corrupt or marked as not authenticated, clear it
          localStorage.removeItem("thera_auth");
          localStorage.removeItem("thera_user_profile");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error parsing auth data from localStorage:", error);
        localStorage.removeItem("thera_auth"); // Clear bad data
        localStorage.removeItem("thera_user_profile");
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []); // Run once on mount

  // NEW: Logout Function
  const handleLogout = () => {
    console.log("HomePage: Frontend logout initiated.");
    // ProfilePage already cleared localStorage, we just update state and redirect
    setIsAuthenticated(false);
    setCurrentView("home"); // Optionally revert to home view after logout
    navigate('/login'); // Redirect to the login page
  };
  // --- END NEW ---

  // First Visit Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFirstVisit(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Chat Handlers
  const handleShareDay = () => {
    // Only allow chat if authenticated, otherwise redirect to login
    if (isAuthenticated) {
      setShowChat(true);
    } else {
      navigate('/login');
    }
  }

  const handleEmotionalUpdate = (wellness, distress) => {
    setEmotionalState({ wellness, distress })
  }

  // Conditional Rendering based on currentView state
  // Only render these protected views if authenticated
  if (isAuthenticated) {
    if (showChat) {
      return <ChatApp onEmotionalUpdate={handleEmotionalUpdate} onBack={() => setShowChat(false)} />
    }

    if (currentView === "garden") {
      return (
        <div className="min-h-screen relative">
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
          <div className="relative z-10">
            <SoulGarden woundSeeds={[]} onBack={() => setCurrentView("home")} emotionalState={emotionalState} />
          </div>
        </div>
      )
    }

    if (currentView === "rituals") {
      return (
        <div className="min-h-screen relative">
          <div className="fixed inset-0 z-0">
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage:
                  theme === "dark"
                    ? "url('/bioluminescent-waterfall.jpg')"
                    : "url('/bright-waterfall.g')"
              }}
            />
            <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />
          </div>
          <div className="relative z-10">
            <HealingRituals onBack={() => setCurrentView("home")} />
          </div>
        </div>
      )
    }

    if (currentView === "profile") {
      return (
        <div className="min-h-screen relative">
          <div className="fixed inset-0 z-0">
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage:
                  theme === "dark" ? "url('/dark-forest-plant.jpg')" : "url('/bright-waterfall.jpg')",
              }}
            />
            <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
          </div>
          <div className="relative z-10">
            {/* Pass the handleLogout function to ProfilePage */}
            <ProfilePage onBack={() => setCurrentView("home")} emotionalState={emotionalState} onLogout={handleLogout} />
          </div>
        </div>
      );
    }

    if (currentView === "journal") {
      return (
        <div className="min-h-screen relative">
          <div className="fixed inset-0 z-0">
            <div
              className="w-full h-full bg-full bg-center bg-no-repeat"
              style={{
                backgroundImage:
                  theme === "dark"
                    ? "url('/bioluminescent-waterfall.jpg')"
                    : "url('/bright-waterfall.jpg')",
              }}
            />
            <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />
          </div>
          <div className="relative z-10">
            <JournalHistory onBack={() => setCurrentView("home")} />
          </div>
        </div>
      );
    }
  }


  // MAIN HOME VIEW (Public or Authenticated Landing Page) -------------------------------------------------
  return (
    <div className="relative min-h-screen overflow-hidden">
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
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-6 right-6 z-50 p-3 bg-white/20 dark:bg-black/30 backdrop-blur-sm rounded-full border border-white/30 dark:border-gray-600 hover:bg-white/30 dark:hover:bg-black/40 transition-all duration-300"
      >
        {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-purple-600" />}
      </motion.button>

      {/* Auth/Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed top-6 left-6 z-50 flex gap-2 flex-wrap" // Added flex-wrap for better layout
      >
        {!isAuthenticated && ( // Only show Login/Signup if not authenticated
          <>
            <Link to="/login">
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/20 dark:bg-black/20 text-white hover:bg-white/30 dark:hover:bg-black/30 backdrop-blur-sm border border-white/30"
              >
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/20 dark:bg-black/20 text-white hover:bg-white/30 dark:hover:bg-black/30 backdrop-blur-sm border border-white/30"
              >
                Sign Up
              </Button>
            </Link>
          </>
        )}

        {/* View Navigation buttons (always available) */}
        {/* Only show these navigation buttons on the main Home view (when not in sub-components) */}
        {currentView === "home" && (
          <>
            {isAuthenticated && ( // Only show profile/journal if authenticated
              <>
                <Button
                  variant={currentView === "profile" ? "default" : "ghost"}
                  size="sm"
                  className={`${
                    currentView === "profile"
                      ? "bg-healing-teal/80 text-white"
                      : "bg-white/20 dark:bg-black/20 text-white hover:bg-white/30 dark:hover:bg-black/30"
                  } backdrop-blur-sm border border-white/30`}
                  onClick={() => setCurrentView("profile")}
                >
                  <User className="w-4 h-4 mr-2" /> Profile
                </Button>
                <Button
                  variant={currentView === "journal" ? "default" : "ghost"}
                  size="sm"
                  className={`${
                    currentView === "journal"
                      ? "bg-healing-teal/80 text-white"
                      : "bg-white/20 dark:bg-black/20 text-white hover:bg-white/30 dark:hover:bg-black/30"
                  } backdrop-blur-sm border border-white/30`}
                  onClick={() => setCurrentView("journal")}
                >
                  <BookOpen className="w-4 h-4 mr-2" /> Journal
                </Button>
              </>
            )}
            <Button
              variant={currentView === "garden" ? "default" : "ghost"}
              size="sm"
              className={`${
                currentView === "garden"
                  ? "bg-healing-teal/80 text-white"
                  : "bg-white/20 dark:bg-black/20 text-white hover:bg-white/30 dark:hover:bg-black/30"
              } backdrop-blur-sm border border-white/30`}
              onClick={() => setCurrentView("garden")}
            >
              🌱 Garden
            </Button>
            <Button
              variant={currentView === "rituals" ? "default" : "ghost"}
              size="sm"
              className={`${
                currentView === "rituals"
                  ? "bg-healing-teal/80 text-white"
                  : "bg-white/20 dark:bg-black/20 text-white hover:bg-white/30 dark:hover:bg-black/30"
              } backdrop-blur-sm border border-white/30`}
              onClick={() => setCurrentView("rituals")}
            >
              🌙 Rituals
            </Button>
            {isAuthenticated && ( // Show Logout button only if authenticated
              <Button
                variant="ghost"
                size="sm"
                className="bg-red-600/80 hover:bg-red-700 dark:bg-red-700/80 dark:hover:bg-red-800 text-white backdrop-blur-sm border border-white/30"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            )}
          </>
        )}
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

        {/* Main CTA Button - "Share Your Day" */}
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
      {isFirstVisit && (
        <motion.div
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
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
