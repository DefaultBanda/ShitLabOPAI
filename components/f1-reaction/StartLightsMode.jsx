"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { saveScore } from "@/utils/leaderboard"
import { isProfane } from "@/utils/profanityFilter"

export default function StartLightsMode({ onBack, nickname, isDarkMode }) {
  const [gameState, setGameState] = useState("ready") // ready, countdown, lights, reaction, result
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [reactionTime, setReactionTime] = useState(null)
  const [bestTime, setBestTime] = useState(null)
  const [lightsOn, setLightsOn] = useState([
    [false, false, false, false, false], // Top row (never illuminates)
    [false, false, false, false, false], // Bottom row (illuminates)
  ])
  const [lightsOut, setLightsOut] = useState(false)
  const [falseStart, setFalseStart] = useState(false)
  const [rating, setRating] = useState({ title: "", description: "" })
  const [playerNickname, setPlayerNickname] = useState(nickname || "")
  const [nicknameError, setNicknameError] = useState("")
  const [showLightsOutText, setShowLightsOutText] = useState(false)

  const mouseDownRef = useRef(false)
  const lightsOutTimeoutRef = useRef(null)
  const lightsSequenceRef = useRef([])

  // Load best time from localStorage
  useEffect(() => {
    const savedBestTime = localStorage.getItem("f1-start-best-time")
    if (savedBestTime) {
      setBestTime(Number.parseFloat(savedBestTime))
    }

    return () => {
      if (lightsOutTimeoutRef.current) {
        clearTimeout(lightsOutTimeoutRef.current)
      }

      // Clear all light sequence timeouts
      lightsSequenceRef.current.forEach((timeout) => clearTimeout(timeout))
    }
  }, [])

  // Handle mouse down
  const handleMouseDown = () => {
    mouseDownRef.current = true

    if (gameState === "lights" && !lightsOut) {
      // False start!
      setFalseStart(true)
      setGameState("result")

      // Clear all timeouts
      if (lightsOutTimeoutRef.current) {
        clearTimeout(lightsOutTimeoutRef.current)
      }

      lightsSequenceRef.current.forEach((timeout) => clearTimeout(timeout))
    } else if (gameState === "lights" && lightsOut) {
      // Good reaction
      const now = performance.now()
      setEndTime(now)
      setReactionTime((now - startTime) / 1000) // Convert to seconds
      setGameState("result")
    }
  }

  // Handle mouse up
  const handleMouseUp = () => {
    mouseDownRef.current = false
  }

  // Start the game
  const startGame = () => {
    setGameState("lights")
    setLightsOn([
      [false, false, false, false, false], // Top row
      [false, false, false, false, false], // Bottom row
    ])
    setLightsOut(false)
    setFalseStart(false)
    setShowLightsOutText(false)

    // Clear previous timeouts
    lightsSequenceRef.current.forEach((timeout) => clearTimeout(timeout))
    lightsSequenceRef.current = []

    // Turn on lights one by one with slower timing
    let currentDelay = 1500 // Start with 1.5s delay before first light

    // Function to turn on a specific light in the bottom row
    const turnOnLight = (col) => {
      const timeout = setTimeout(() => {
        setLightsOn((prev) => {
          const newLights = JSON.parse(JSON.stringify(prev))
          newLights[1][col] = true // Only illuminate bottom row
          return newLights
        })
      }, currentDelay)

      lightsSequenceRef.current.push(timeout)
      currentDelay += 800 + Math.random() * 400 // 0.8-1.2s between lights
    }

    // Turn on lights in sequence (left to right, bottom row only)
    for (let col = 0; col < 5; col++) {
      turnOnLight(col)
    }

    // Random delay before lights out (0-1.2s after all lights are on)
    const lightsOutDelay = currentDelay + Math.random() * 1200

    lightsOutTimeoutRef.current = setTimeout(() => {
      setStartTime(performance.now())
      setLightsOut(true)
      setLightsOn([
        [false, false, false, false, false], // Top row
        [false, false, false, false, false], // Bottom row
      ])
      setShowLightsOutText(true)
    }, lightsOutDelay)
  }

  // Get F1-themed reaction rating with funny descriptions
  const getF1ReactionRating = (time) => {
    if (time < 0.15)
      return {
        title: "Superhuman!",
        description: "Even Max Verstappen would be impressed!",
      }
    if (time < 0.2)
      return {
        title: "F1 Champion Material!",
        description: "Lewis Hamilton would approve of those reflexes.",
      }
    if (time < 0.25)
      return {
        title: "Race Winner!",
        description: "Lando Norris would give you a thumbs up.",
      }
    if (time < 0.3)
      return {
        title: "Podium Finisher",
        description: "Charles Leclerc would be proud of that reaction.",
      }
    if (time < 0.35)
      return {
        title: "Points Finisher",
        description: "Fernando Alonso would call that 'not bad for a rookie'.",
      }
    if (time < 0.4)
      return {
        title: "Midfield Qualifier",
        description: "Solid reaction time, but Toto Wolff expects more.",
      }
    return {
      title: "Back of the Grid",
      description: "Keep practicing! Even Latifi had to start somewhere.",
    }
  }

  // Format time in 00.000 format
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return "---.---"
    const sec = Math.floor(seconds)
    const ms = Math.round((seconds - sec) * 1000)
    return `${sec.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`
  }

  // Try again
  const tryAgain = () => {
    setGameState("ready")
    setReactionTime(null)
  }

  // Save score to leaderboard
  const saveToLeaderboard = () => {
    if (!playerNickname.trim()) {
      setNicknameError("Please enter a nickname")
      return
    }

    if (isProfane(playerNickname)) {
      setNicknameError("Really? Please use appropriate language.")
      return
    }

    setNicknameError("")

    // Save to leaderboard
    saveScore(playerNickname, reactionTime * 1000, "start")
      .then(() => {
        // Navigate back to menu after saving
        if (typeof onBack === "function") {
          onBack()
        } else {
          console.log("Score saved, but onBack is not a function")
          setGameState("ready")
        }
      })
      .catch((error) => {
        console.error("Error saving score:", error)
        setNicknameError("Failed to save score. Please try again.")
      })
  }

  // Update best time if needed
  useEffect(() => {
    if (reactionTime && !falseStart && (!bestTime || reactionTime < bestTime)) {
      setBestTime(reactionTime)
      localStorage.setItem("f1-start-best-time", reactionTime.toString())
    }
  }, [reactionTime, falseStart, bestTime])

  // Set rating when reaction time changes
  useEffect(() => {
    if (reactionTime && !falseStart) {
      const newRating = getF1ReactionRating(reactionTime)
      setRating(newRating)
    }
  }, [reactionTime, falseStart])

  // Add event listeners for mouse up outside the button
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (mouseDownRef.current) {
        handleMouseUp()
      }
    }

    window.addEventListener("mouseup", handleGlobalMouseUp)
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [])

  return (
    <motion.div
      key="start-lights-mode"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className={`${isDarkMode ? "bg-gray-900" : "bg-gray-100"} rounded-xl p-6 shadow-md mb-6`}>
        <h2 className={`text-2xl font-bold mb-6 text-center ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Start Lights Mode
        </h2>

        {gameState === "ready" && (
          <div className="text-center">
            <p className={`mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Test your reaction time to the F1 start lights! When all the red lights go out, click as fast as you can.
              But be careful - if you click before the lights go out, it's a false start!
            </p>

            {bestTime && <p className="mb-6 text-green-500 font-semibold">Your best time: {formatTime(bestTime)}s</p>}

            <motion.button
              onClick={startGame}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start
            </motion.button>
          </div>
        )}

        {gameState === "lights" && (
          <div className="text-center">
            <div className="mb-8">
              {/* F1 style lights - 2 rows of 5 lights */}
              <div className="bg-black p-6 rounded-xl mb-4 inline-block">
                {/* Horizontal bar connecting lights */}
                <div className="w-full h-2 bg-gray-700 mb-2"></div>

                <div className="flex flex-col gap-4">
                  {lightsOn.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-5 gap-4">
                      {row.map((isOn, index) => (
                        <div
                          key={`${rowIndex}-${index}`}
                          className={`w-14 h-14 rounded-md border-2 border-gray-700 flex items-center justify-center
                            relative overflow-hidden
                            ${rowIndex === 1 && isOn ? "bg-red-600" : "bg-gray-800"}`}
                        >
                          {/* Light housing details */}
                          <div className="absolute inset-0 bg-[#6b5d4e] rounded-sm">
                            {/* Side wings */}
                            <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-2 h-6 bg-[#6b5d4e]"></div>
                            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-2 h-6 bg-[#6b5d4e]"></div>

                            {/* Light circle */}
                            <div
                              className={`absolute inset-2 rounded-full border-2 border-gray-500
                              ${rowIndex === 1 && isOn ? "bg-red-500" : "bg-gray-700"}`}
                            >
                              {/* Light reflection */}
                              {rowIndex === 1 && isOn && (
                                <div className="absolute top-1 left-1 w-2 h-2 bg-red-300 rounded-full opacity-50"></div>
                              )}
                            </div>

                            {/* Bolts in corners */}
                            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                            <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Horizontal bar connecting lights */}
                <div className="w-full h-2 bg-gray-700 mt-2"></div>
              </div>

              {showLightsOutText && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"} mb-4`}
                >
                  It's lights out and away we go!
                </motion.p>
              )}
            </div>

            <motion.button
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              className="w-full h-32 bg-green-600 hover:bg-green-700 text-white text-2xl font-bold rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              CLICK WHEN LIGHTS GO OUT
            </motion.button>
          </div>
        )}

        {gameState === "result" && (
          <div className="text-center">
            {falseStart ? (
              <div className="mb-6">
                <p className="text-3xl font-bold text-red-500 mb-2">FALSE START!</p>
                <p className={`${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  You jumped the lights! In a real F1 race, you'd get a penalty.
                </p>
              </div>
            ) : (
              <div className="mb-6">
                <p className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Your Reaction Time
                </p>
                <p className="text-5xl font-mono font-bold text-green-500 mb-2">{formatTime(reactionTime)}s</p>
                <p className="text-2xl font-bold text-blue-500">{rating.title}</p>
                <p className={`${isDarkMode ? "text-gray-300" : "text-gray-700"} mt-2 italic`}>
                  "{rating.description}"
                </p>

                {bestTime === reactionTime && (
                  <motion.p
                    className="mt-2 text-yellow-500 font-bold"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ repeat: 3, duration: 0.3 }}
                  >
                    New Best Time!
                  </motion.p>
                )}
              </div>
            )}

            {!falseStart && (
              <div className="mb-6">
                <label className={`block ${isDarkMode ? "text-gray-300" : "text-gray-700"} mb-2`}>
                  Enter your nickname for the leaderboard:
                </label>
                <input
                  type="text"
                  value={playerNickname}
                  onChange={(e) => setPlayerNickname(e.target.value)}
                  className={`px-4 py-2 ${
                    isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                  } rounded-lg w-full max-w-xs border ${isDarkMode ? "border-gray-700" : "border-gray-300"}`}
                  placeholder="Your nickname"
                />
                {nicknameError && <p className="text-red-500 mt-1">{nicknameError}</p>}
              </div>
            )}

            <div className="flex justify-center space-x-4">
              {!falseStart && (
                <motion.button
                  onClick={saveToLeaderboard}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Save Score
                </motion.button>
              )}

              <motion.button
                onClick={tryAgain}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <motion.button
          onClick={() => {
            if (typeof onBack === "function") {
              onBack()
            } else {
              console.log("onBack is not a function")
              // Fallback behavior
              window.history.back()
            }
          }}
          className={`px-6 py-2 ${
            isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"
          } rounded-lg`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Back to Menu
        </motion.button>
      </div>
    </motion.div>
  )
}
