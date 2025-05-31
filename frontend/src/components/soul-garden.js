"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "./../components/ui/card"
import { Button } from "./../components/ui/button"
import { Progress } from "./../components/ui/progress"
import { ArrowLeft } from "lucide-react"

export default function SoulGarden({ woundSeeds, onBack, emotionalState }) {
  const getPlantStage = (progress) => {
    if (progress < 25) return { emoji: "🌱", stage: "Seed" }
    if (progress < 50) return { emoji: "🌿", stage: "Sprout" }
    if (progress < 75) return { emoji: "🌸", stage: "Bud" }
    return { emoji: "🌺", stage: "Bloom" }
  }

  const waterPlant = (seedId) => {
    // This would update the healing progress in your backend
    console.log(`Watering plant ${seedId}`)
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
            <CardTitle className="text-green-800 dark:text-green-200 text-center">🌿 Your Soul Garden</CardTitle>
            <p className="text-green-700 dark:text-green-400 text-center text-sm">
              Each wound becomes a seed. With care and time, they bloom into wisdom.
            </p>
          </CardHeader>
          <CardContent>
            {/* Garden Visualization */}
            <div className="relative bg-gradient-to-b from-sky-100/20 to-green-100/20 rounded-lg p-8 min-h-64 border border-white/10">
              {/* Garden content remains the same but with updated styling for transparency */}
              <div className="relative z-10 grid grid-cols-3 md:grid-cols-4 gap-4 h-full items-end">
                {woundSeeds.map((seed, index) => {
                  const plant = getPlantStage(seed.healingProgress)
                  return (
                    <motion.div
                      key={seed.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="text-center"
                    >
                      <motion.div
                        className="text-4xl mb-2 cursor-pointer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        animate={{
                          y: [0, -5, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                          delay: index * 0.3,
                        }}
                        onClick={() => waterPlant(seed.id)}
                      >
                        {plant.emoji}
                      </motion.div>
                      <p className="text-xs text-green-800 dark:text-green-300 font-medium">{seed.theme}</p>
                      <p className="text-xs text-green-700 dark:text-green-400">{plant.stage}</p>
                    </motion.div>
                  )
                })}

                {/* Empty spots for future growth */}
                {[...Array(Math.max(0, 8 - woundSeeds.length))].map((_, index) => (
                  <div key={`empty-${index}`} className="text-center opacity-30">
                    <div className="text-2xl mb-2">🌱</div>
                    <p className="text-xs text-green-700/70 dark:text-green-400/70">Ready to grow</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wound Seeds Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {woundSeeds.map((seed) => {
            const plant = getPlantStage(seed.healingProgress)
            return (
              <Card key={seed.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{plant.emoji}</span>
                      <div>
                        <h3 className="font-medium text-green-800 dark:text-green-200 capitalize">{seed.theme}</h3>
                        <p className="text-xs text-green-700 dark:text-green-400">{plant.stage}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-green-700 dark:text-green-400">Seen {seed.occurrences} times</p>
                      <p className="text-xs text-green-600 dark:text-green-500">
                        Last: {seed.lastSeen.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700 dark:text-green-400">Healing Progress</span>
                      <span className="text-green-700 dark:text-green-400">{seed.healingProgress}%</span>
                    </div>
                    <Progress value={seed.healingProgress} className="h-2 bg-white/20" />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 border-white/20 text-green-800 dark:text-green-300 hover:bg-white/20"
                    onClick={() => waterPlant(seed.id)}
                  >
                    💧 Water with Love
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}


