"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import StartLightsMode from "@/components/f1-reaction/StartLightsMode"
import PitStopMode from "@/components/f1-reaction/PitStopMode"
import Leaderboard from "@/components/f1-reaction/Leaderboard"

export default function F1ReactionPage() {
  const [mode, setMode] = useState("start") // "start" or "pit"
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [nickname, setNickname] = useState("")
  const [hasSetNickname, setHasSetNickname] = useState(false)

  // Check if nickname exists in localStorage
  useState(() => {
    const savedNickname = localStorage.getItem("f1ReactionNickname")
    if (savedNickname) {
      setNickname(savedNickname)
      setHasSetNickname(true)
    }
  }, [])

  const handleSetNickname = () => {
    if (nickname.trim()) {
      localStorage.setItem("f1ReactionNickname", nickname)
      setHasSetNickname(true)
    }
  }

  const handleModeChange = (newMode) => {
    setMode(newMode)
    setShowLeaderboard(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1
        className="text-4xl md:text-5xl font-bold text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        F1 Reaction Test
      </motion.h1>

      {!hasSetNickname ? (
        <motion.div
          className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-4">Enter Your Nickname</h2>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Your nickname"
            className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600"
            maxLength={15}
          />
          <button
            onClick={handleSetNickname}
            disabled={!nickname.trim()}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded disabled:opacity-50"
          >
            Continue
          </button>
        </motion.div>
      ) : (
        <>
          <div className="flex justify-center mb-6 space-x-4">
            <button
              onClick={() => handleModeChange("start")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                mode === "start"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              Start Lights
            </button>
            <button
              onClick={() => handleModeChange("pit")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                mode === "pit"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              Pit Stop
            </button>
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                showLeaderboard
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              Leaderboard
            </button>
          </div>

          {showLeaderboard ? (
            <Leaderboard mode={mode} nickname={nickname} />
          ) : mode === "start" ? (
            <StartLightsMode nickname={nickname} />
          ) : (
            <PitStopMode nickname={nickname} />
          )}
        </>
      )}
    </div>
  )
}
