"use client"

import { motion } from "framer-motion"
import { Heart, AlertTriangle } from "lucide-react"

export default function EmotionalProgressBar({ wellness, distress, className = "", showLabels = true }) {
  // Calculate the position on a single bar
  // Middle (50) = neutral, Right (100) = high wellness, Left (0) = high distress
  const calculatePosition = () => {
    const netWellness = wellness - distress
    // Convert from -100 to +100 range to 0 to 100 range
    return Math.max(0, Math.min(100, 50 + netWellness / 2))
  }

  const position = calculatePosition()

  const getEmotionalState = () => {
    if (position > 75) return { text: "Thriving", color: "text-green-600 dark:text-green-400", emoji: "🌸" }
    if (position > 60) return { text: "Growing", color: "text-green-700 dark:text-green-500", emoji: "🌱" }
    if (position > 40) return { text: "Balanced", color: "text-green-800 dark:text-green-600", emoji: "💜" }
    if (position > 25) return { text: "Struggling", color: "text-yellow-600 dark:text-yellow-400", emoji: "🌧️" }
    return { text: "Crisis", color: "text-red-600 dark:text-red-400", emoji: "⛈️" }
  }

  const state = getEmotionalState()

  return (
    <div className={`space-y-3 ${className}`}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
            <span className="text-green-700 dark:text-green-400">Crisis</span>
          </div>
          <div className={`flex items-center gap-1 font-medium ${state.color}`}>
            <span>{state.emoji}</span>
            <span>{state.text}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-green-700 dark:text-green-400">Thriving</span>
            <Heart className="w-3 h-3 text-green-600 dark:text-green-400" />
          </div>
        </div>
      )}

      {/* Single Progress Bar */}
      <div className="relative">
        {/* Background gradient bar */}
        <div className="h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 to-green-600 border border-white/20 dark:border-gray-600/30 shadow-inner"></div>

        {/* Position indicator */}
        <motion.div
          className="absolute top-0 h-3 w-6 bg-white dark:bg-gray-200 rounded-full border-2 border-green-600 dark:border-green-500 shadow-lg"
          style={{ left: `calc(${position}% - 12px)` }}
          animate={{ left: `calc(${position}% - 12px)` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* Center marker */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-3 w-0.5 bg-green-600 dark:bg-green-500 opacity-50"></div>
      </div>

      {/* Numerical indicators */}
      {showLabels && (
        <div className="flex justify-between text-xs text-green-600 dark:text-green-400">
          <span>0</span>
          <span>25</span>
          <span className="font-medium">50</span>
          <span>75</span>
          <span>100</span>
        </div>
      )}
    </div>
  )
}

