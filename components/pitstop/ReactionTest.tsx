"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface ReactionTestProps {
  onComplete: (reactionTime: number, earlyStart: boolean) => void
}

export default function ReactionTest({ onComplete }: ReactionTestProps) {
  const [status, setStatus] = useState<"waiting" | "ready" | "clicked">("waiting")
  const [startTime, setStartTime] = useState<number | null>(null)
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Random delay between 2-5 seconds
    const delay = Math.floor(Math.random() * 3000) + 2000

    timerRef.current = setTimeout(() => {
      setStatus("ready")
      setStartTime(Date.now())
    }, delay)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleClick = () => {
    if (status === "waiting") {
      // Clicked too early
      onComplete(0, true)
    } else if (status === "ready") {
      // Good click
      const endTime = Date.now()
      const reaction = (endTime - (startTime || 0)) / 1000
      setReactionTime(reaction)
      setStatus("clicked")

      // Complete after showing the reaction time briefly
      setTimeout(() => {
        onComplete(reaction, false)
      }, 1000)
    }
  }

  return (
    <motion.div
      className={`
        w-full max-w-md h-64 rounded-xl shadow-md flex flex-col items-center justify-center cursor-pointer
        ${status === "waiting" ? "bg-red-600" : status === "ready" ? "bg-green-600" : "bg-blue-600"}
        text-white
      `}
      onClick={handleClick}
      animate={{
        scale: status === "ready" ? [1, 1.05, 1] : 1,
        backgroundColor: status === "ready" ? "#10b981" : undefined,
      }}
      transition={{ duration: 0.3 }}
    >
      {status === "waiting" && <span className="text-3xl font-bold mb-2">WAIT</span>}

      {status === "ready" && <span className="text-5xl font-bold mb-2">GO!</span>}

      {status === "clicked" && (
        <>
          <span className="text-3xl font-bold mb-2">Reaction Time</span>
          <span className="text-5xl font-mono">{reactionTime?.toFixed(3)}s</span>
        </>
      )}

      <p className="text-sm mt-4 max-w-xs text-center">
        {status === "waiting"
          ? "Wait for the green light. Click as soon as you see GO!"
          : status === "ready"
            ? "Click now!"
            : "Great reaction!"}
      </p>
    </motion.div>
  )
}
