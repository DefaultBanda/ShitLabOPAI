"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"

interface LiveTimerProps {
  startTime: number | null
  currentTime: number
  setCurrentTime: (time: number) => void
}

export default function LiveTimer({ startTime, currentTime, setCurrentTime }: LiveTimerProps) {
  useEffect(() => {
    if (!startTime) return

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      setCurrentTime(elapsed)
    }, 10) // Update every 10ms for smooth timer

    return () => clearInterval(interval)
  }, [startTime, setCurrentTime])

  // Format time to display with 2 decimal places
  const formattedTime = currentTime.toFixed(2)

  return (
    <div className="bg-black text-white p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center">
        <span className="text-lg font-medium">Pit Stop Time</span>
        <motion.span
          key={formattedTime}
          initial={{ opacity: 0.8, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-3xl font-mono font-bold"
        >
          {formattedTime}s
        </motion.span>
      </div>
    </div>
  )
}
