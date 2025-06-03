"use client"

import { motion } from "framer-motion"

interface ResultScreenProps {
  result: {
    totalTime: number
    baseTime: number
    reactionTime: number
    penalties: {
      wrongOrder: number
      slowClicks: number
      earlyStart: number
      stuckWheel: number
    }
    grade: "perfect" | "good" | "slow"
    tyreSequence: string[]
    tyreClickTimes: Record<string, number>
  }
  onTryAgain: () => void
}

export default function ResultScreen({ result, onTryAgain }: ResultScreenProps) {
  // Get grade emoji and color
  const gradeInfo = {
    perfect: { emoji: "🔥", label: "Perfect", color: "text-green-500" },
    good: { emoji: "🟡", label: "Good", color: "text-yellow-500" },
    slow: { emoji: "🔴", label: "Slow", color: "text-red-500" },
  }

  const { emoji, label, color } = gradeInfo[result.grade]

  // Calculate total penalties
  const totalPenalties =
    result.penalties.wrongOrder +
    result.penalties.slowClicks +
    result.penalties.earlyStart +
    result.penalties.stuckWheel

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Pit Stop Complete!</h2>

      <div className="flex flex-col items-center mb-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="text-6xl mb-2"
        >
          {emoji}
        </motion.div>

        <div className={`text-4xl font-bold ${color}`}>{label}</div>

        <div className="text-5xl font-mono font-bold mt-4">{result.totalTime.toFixed(2)}s</div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-bold mb-3">Time Breakdown</h3>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Base Time:</span>
            <span className="font-mono">{result.baseTime.toFixed(2)}s</span>
          </div>

          {result.penalties.wrongOrder > 0 && (
            <div className="flex justify-between text-red-500">
              <span>Wrong Order Penalty:</span>
              <span className="font-mono">+{result.penalties.wrongOrder.toFixed(2)}s</span>
            </div>
          )}

          {result.penalties.slowClicks > 0 && (
            <div className="flex justify-between text-red-500">
              <span>Slow Clicks Penalty:</span>
              <span className="font-mono">+{result.penalties.slowClicks.toFixed(2)}s</span>
            </div>
          )}

          {result.penalties.earlyStart > 0 && (
            <div className="flex justify-between text-red-500">
              <span>Early Start Penalty:</span>
              <span className="font-mono">+{result.penalties.earlyStart.toFixed(2)}s</span>
            </div>
          )}

          {result.penalties.stuckWheel > 0 && (
            <div className="flex justify-between text-red-500">
              <span>Stuck Wheel Penalty:</span>
              <span className="font-mono">+{result.penalties.stuckWheel.toFixed(2)}s</span>
            </div>
          )}

          {totalPenalties > 0 && (
            <div className="flex justify-between font-bold border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
              <span>Total Time:</span>
              <span className="font-mono">{result.totalTime.toFixed(2)}s</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-bold mb-3">Performance Rating</h3>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div
            className={`p-2 rounded ${result.grade === "perfect" ? "bg-green-100 dark:bg-green-900" : "bg-gray-200 dark:bg-gray-600"}`}
          >
            <div className="text-2xl">🔥</div>
            <div className="text-sm font-medium">Perfect</div>
            <div className="text-xs">Under 2.8s</div>
          </div>

          <div
            className={`p-2 rounded ${result.grade === "good" ? "bg-yellow-100 dark:bg-yellow-900" : "bg-gray-200 dark:bg-gray-600"}`}
          >
            <div className="text-2xl">🟡</div>
            <div className="text-sm font-medium">Good</div>
            <div className="text-xs">2.8s - 3.5s</div>
          </div>

          <div
            className={`p-2 rounded ${result.grade === "slow" ? "bg-red-100 dark:bg-red-900" : "bg-gray-200 dark:bg-gray-600"}`}
          >
            <div className="text-2xl">🔴</div>
            <div className="text-sm font-medium">Slow</div>
            <div className="text-xs">Over 3.5s</div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <motion.button
          onClick={onTryAgain}
          className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Try Again
        </motion.button>
      </div>
    </div>
  )
}
