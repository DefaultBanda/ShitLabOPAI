"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import StartLightsMode from "@/components/f1-reaction/StartLightsMode"
import PitStopMode from "@/components/f1-reaction/PitStopMode"
import Leaderboard from "@/components/f1-reaction/Leaderboard"

export default function F1ReactionGame() {
  const [gameMode, setGameMode] = useState("start") // "start", "lights", "pitstop", "leaderboard"
  const [currentMode, setCurrentMode] = useState("lights") // "lights" or "pitstop"
  const [nickname, setNickname] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showNicknamePrompt, setShowNicknamePrompt] = useState(false)

  // Check for dark mode preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDarkMode(darkModePreference)

      // Add listener for changes
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e) => setIsDarkMode(e.matches)
      mediaQuery.addEventListener("change", handleChange)

      // Check if nickname exists
      const savedNickname = localStorage.getItem("f1-reaction-nickname")
      if (savedNickname) {
        setNickname(savedNickname)
      }

      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  // Start a game mode
  const startGame = (mode) => {
    setCurrentMode(mode)

    // Check if nickname exists
    const savedNickname = localStorage.getItem("f1-reaction-nickname")
    if (!savedNickname) {
      setShowNicknamePrompt(true)
    } else {
      setGameMode(mode)
    }
  }

  // Save nickname and start game
  const saveNicknameAndStart = () => {
    if (nickname.trim()) {
      localStorage.setItem("f1-reaction-nickname", nickname)
      setShowNicknamePrompt(false)
      setGameMode(currentMode)
    }
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <div className="dark:bg-gray-900 bg-gray-50 min-h-screen">
        <header className="bg-red-600 text-white py-4 shadow-md">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold">F1 Reaction Time Test</h1>
            <div>
              <Image src={isDarkMode ? "/SimLD.png" : "/SimL.png"} alt="Logo" width={40} height={40} />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {gameMode === "start" && (
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
                      <Image
                        src="/images/f1-reaction-lights.png"
                        alt="F1 Reaction Lights"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold mb-4 text-center">Choose Your Mode</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <motion.button
                      onClick={() => startGame("lights")}
                      className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-xl mb-2">Start Lights Mode</div>
                      <p className="text-sm opacity-80">Test your reaction to F1 start lights</p>
                    </motion.button>

                    <motion.button
                      onClick={() => startGame("pitstop")}
                      className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-xl mb-2">Pit Stop Mode</div>
                      <p className="text-sm opacity-80">Change tires as fast as possible</p>
                    </motion.button>
                  </div>

                  <div className="text-center">
                    <motion.button
                      onClick={() => setGameMode("leaderboard")}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-bold transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Leaderboard
                    </motion.button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                  <h3 className="text-xl font-bold mb-4">How to Play</h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold">Start Lights Mode</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Wait for all 5 red lights to come on, then go when they all turn off. Don't jump the start!
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold">Pit Stop Mode</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Tap each tire in the highlighted sequence as quickly as possible. Aim for under 2.5 seconds for
                        a perfect pit stop!
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {gameMode === "lights" && (
              <StartLightsMode onBack={() => setGameMode("start")} nickname={nickname} isDarkMode={isDarkMode} />
            )}

            {gameMode === "pitstop" && (
              <PitStopMode onBack={() => setGameMode("start")} nickname={nickname} isDarkMode={isDarkMode} />
            )}

            {gameMode === "leaderboard" && <Leaderboard onBack={() => setGameMode("start")} isDarkMode={isDarkMode} />}
          </AnimatePresence>
        </main>

        {/* Nickname Prompt Modal */}
        <AnimatePresence>
          {showNicknamePrompt && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Enter Your Nickname</h2>
                  <p className="mb-4 text-gray-600 dark:text-gray-300">This will be used for the leaderboard.</p>

                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Your nickname"
                    maxLength={15}
                    className="w-full p-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700"
                  />

                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowNicknamePrompt(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveNicknameAndStart}
                      disabled={!nickname.trim()}
                      className={`px-4 py-2 rounded-lg ${
                        nickname.trim()
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Save & Start
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="bg-red-600 text-white py-3 mt-8">
          <div className="container mx-auto px-4 text-center text-sm">
            <p>Created by Karman B, Ishvir C, and David Y</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
