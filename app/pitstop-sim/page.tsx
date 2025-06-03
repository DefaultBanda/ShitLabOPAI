"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Head from "next/head"
import Image from "next/image"
import Countdown from "@/components/pitstop/Countdown"
import PitStopPad from "@/components/pitstop/PitStopPad"
import LiveTimer from "@/components/pitstop/LiveTimer"
import ResultScreen from "@/components/pitstop/ResultScreen"
import ReactionTest from "@/components/pitstop/ReactionTest"

// Game states
type GameState = "start" | "countdown" | "reaction" | "pitstop" | "result"

// Result type
interface GameResult {
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

export default function PitStopSim() {
  // Game state
  const [gameState, setGameState] = useState<GameState>("start")
  const [enableReactionTest, setEnableReactionTest] = useState(true)
  const [enableRandomMistake, setEnableRandomMistake] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Game timing
  const [startTime, setStartTime] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [tyreClickTimes, setTyreClickTimes] = useState<Record<string, number>>({})
  const [tyreSequence, setTyreSequence] = useState<string[]>([])
  const [penalties, setPenalties] = useState({
    wrongOrder: 0,
    slowClicks: 0,
    earlyStart: 0,
    stuckWheel: 0,
  })
  const [stuckWheel, setStuckWheel] = useState<string | null>(null)
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [reactionTime, setReactionTime] = useState<number>(0)

  // Correct tyre sequence
  const correctSequence = ["FL", "FR", "RL", "RR"]

  // Check for dark mode preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDarkMode(darkModePreference)

      // Add listener for changes
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e) => setIsDarkMode(e.matches)
      mediaQuery.addEventListener("change", handleChange)

      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  // Start the game
  const startGame = () => {
    // Reset game state
    setTyreClickTimes({})
    setTyreSequence([])
    setPenalties({
      wrongOrder: 0,
      slowClicks: 0,
      earlyStart: 0,
      stuckWheel: 0,
    })
    setStuckWheel(null)
    setGameResult(null)
    setCurrentTime(0)
    setReactionTime(0)

    // Start countdown
    setGameState("countdown")
  }

  // Handle countdown completion
  const handleCountdownComplete = () => {
    if (enableReactionTest) {
      setGameState("reaction")
    } else {
      setGameState("pitstop")
      setStartTime(Date.now())
    }
  }

  // Handle reaction test completion
  const handleReactionComplete = (reactionTime: number, earlyStart: boolean) => {
    setReactionTime(reactionTime)
    setGameState("pitstop")
    setStartTime(Date.now())

    // Apply penalty for early start
    if (earlyStart) {
      setPenalties((prev) => ({
        ...prev,
        earlyStart: 1.5,
      }))
    }
  }

  // Handle tyre click
  const handleTyreClick = (tyre: string) => {
    const clickTime = Date.now()

    // Record click time
    setTyreClickTimes((prev) => ({
      ...prev,
      [tyre]: clickTime,
    }))

    // Add to sequence
    setTyreSequence((prev) => {
      const newSequence = [...prev, tyre]

      // Check if correct sequence so far
      const isCorrectSoFar = newSequence.every((t, idx) => t === correctSequence[idx])

      if (!isCorrectSoFar) {
        // Apply penalty for wrong order
        setPenalties((prev) => ({
          ...prev,
          wrongOrder: prev.wrongOrder + 1.0,
        }))
      }

      // Check for slow click (if not the first click)
      if (prev.length > 0) {
        const lastClickTime = tyreClickTimes[prev[prev.length - 1]]
        const timeBetweenClicks = (clickTime - lastClickTime) / 1000

        if (timeBetweenClicks > 0.6) {
          // Apply penalty for slow click
          setPenalties((prev) => ({
            ...prev,
            slowClicks: prev.slowClicks + 0.2,
          }))
        }
      }

      // Check if this is the last tyre
      if (newSequence.length === 4) {
        // Game complete
        finishGame(clickTime)
      }

      return newSequence
    })

    // Random pit crew mistake (20% chance)
    if (enableRandomMistake && Math.random() < 0.2 && !stuckWheel) {
      setStuckWheel(tyre)

      // Apply penalty for stuck wheel
      setPenalties((prev) => ({
        ...prev,
        stuckWheel: 0.3,
      }))

      // Clear stuck wheel after 1 second
      setTimeout(() => {
        setStuckWheel(null)
      }, 1000)
    }
  }

  // Finish the game
  const finishGame = (endTime: number) => {
    const totalGameTime = (endTime - (startTime || 0)) / 1000

    // Calculate total time with penalties
    const totalTime =
      totalGameTime + penalties.wrongOrder + penalties.slowClicks + penalties.earlyStart + penalties.stuckWheel

    // Determine grade
    let grade: "perfect" | "good" | "slow" = "slow"
    if (totalTime < 2.8) {
      grade = "perfect"
    } else if (totalTime < 3.5) {
      grade = "good"
    }

    // Set game result
    setGameResult({
      totalTime,
      baseTime: totalGameTime,
      reactionTime,
      penalties,
      grade,
      tyreSequence,
      tyreClickTimes,
    })

    // Show result screen
    setGameState("result")
  }

  // Try again
  const handleTryAgain = () => {
    setGameState("start")
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <div className="dark:bg-gray-900 bg-gray-50 min-h-screen">
        <Head>
          <link rel="icon" href={isDarkMode ? "/SimLD.png" : "/SimL.png"} />
          <title>F1 Pit Stop Sim | PhysicsLab</title>
        </Head>

        <header className="bg-black text-white py-4 shadow-md">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold">F1 Pit Stop Sim</h1>
            <div>
              <Image src={isDarkMode ? "/SimLD.png" : "/SimL.png"} alt="Logo" width={40} height={40} />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {gameState === "start" && (
              <motion.div
                key="start-screen"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6">
                  <div className="flex justify-center mb-6">
                    <div className="w-64 h-40 relative">
                      <Image src="/placeholder.svg?height=160&width=256" alt="F1 Car" fill className="object-contain" />
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold mb-4 text-center">Welcome to the F1 Pit Stop Sim!</h2>

                  <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                    Click all 4 tyres in the correct order (FL, FR, RL, RR) as quickly as possible. Wrong clicks or
                    hesitation will increase your pit stop time.
                  </p>

                  <div className="flex flex-col space-y-4 mb-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="reaction-test"
                        checked={enableReactionTest}
                        onChange={() => setEnableReactionTest(!enableReactionTest)}
                        className="mr-2 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <label htmlFor="reaction-test" className="text-sm font-medium">
                        Add Reaction Test Start
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="random-mistake"
                        checked={enableRandomMistake}
                        onChange={() => setEnableRandomMistake(!enableRandomMistake)}
                        className="mr-2 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <label htmlFor="random-mistake" className="text-sm font-medium">
                        Enable Random Pit Crew Mistakes
                      </label>
                    </div>
                  </div>

                  <div className="text-center">
                    <motion.button
                      onClick={startGame}
                      className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Start Pit Stop
                    </motion.button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                  <h3 className="text-xl font-bold mb-4">How to Play</h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold">1. Get Ready</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Wait for the countdown and prepare to click the tyres in order.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold">2. Click in Order</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Click the tyres in this order: Front Left (FL), Front Right (FR), Rear Left (RL), Rear Right
                        (RR).
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold">3. Be Fast &amp; Accurate</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Wrong clicks = +1.0s penalty. Slow clicks (&gt;0.6s) = +0.2s penalty.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold">4. Watch for Stuck Wheels</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Random wheel gun issues may occur, adding +0.3s to your time.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {gameState === "countdown" && (
              <motion.div
                key="countdown-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-[60vh]"
              >
                <Countdown onComplete={handleCountdownComplete} />
              </motion.div>
            )}

            {gameState === "reaction" && (
              <motion.div
                key="reaction-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-[60vh]"
              >
                <ReactionTest onComplete={handleReactionComplete} />
              </motion.div>
            )}

            {gameState === "pitstop" && (
              <motion.div
                key="pitstop-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-2xl mx-auto"
              >
                <div className="mb-6">
                  <LiveTimer startTime={startTime} currentTime={currentTime} setCurrentTime={setCurrentTime} />
                </div>

                <PitStopPad onTyreClick={handleTyreClick} tyreSequence={tyreSequence} stuckWheel={stuckWheel} />
              </motion.div>
            )}

            {gameState === "result" && gameResult && (
              <motion.div
                key="result-screen"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto"
              >
                <ResultScreen result={gameResult} onTryAgain={handleTryAgain} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="bg-black text-white py-3 mt-8">
          <div className="container mx-auto px-4 text-center text-sm">
            <p>Created by Karman B, Ishvir C, and David Y</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
