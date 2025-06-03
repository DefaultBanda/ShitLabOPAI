"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface CountdownProps {
  onComplete: () => void
}

export default function Countdown({ onComplete }: CountdownProps) {
  const [count, setCount] = useState<number | string>(3)

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (count === 3) {
      timer = setTimeout(() => setCount(2), 1000)
    } else if (count === 2) {
      timer = setTimeout(() => setCount(1), 1000)
    } else if (count === 1) {
      timer = setTimeout(() => setCount("GO!"), 1000)
    } else if (count === "GO!") {
      timer = setTimeout(() => onComplete(), 500)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [count, onComplete])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={count.toString()}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <span
          className={`text-8xl font-bold ${count === "GO!" ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}
        >
          {count}
        </span>
      </motion.div>
    </AnimatePresence>
  )
}
