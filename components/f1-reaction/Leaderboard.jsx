"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getScores } from "@/utils/leaderboard"

export default function Leaderboard({ mode, isDarkMode }) {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(mode || "start")

  useEffect(() => {
    async function fetchScores() {
      try {
        setLoading(true)
        const data = await getScores(activeTab, 10)
        setScores(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching leaderboard:", err)
        setError("Failed to load leaderboard")
      } finally {
        setLoading(false)
      }
    }

    fetchScores()
  }, [activeTab])

  // Format time in 00.000 format
  const formatTime = (ms) => {
    if (!ms && ms !== 0) return "---.---"
    const seconds = Math.floor(ms / 1000)
    const milliseconds = Math.floor(ms % 1000)
    return `${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`
  }

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch (e) {
      return "Unknown date"
    }
  }

  return (
    <div className={`rounded-lg overflow-hidden shadow-lg ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
      <div className={`px-4 py-3 ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}>
        <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>Leaderboard</h3>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`flex-1 py-2 font-medium ${
            activeTab === "start" ? "text-red-600 border-b-2 border-red-600" : "text-gray-500 dark:text-gray-400"
          }`}
          onClick={() => setActiveTab("start")}
        >
          Start Lights
        </button>
        <button
          className={`flex-1 py-2 font-medium ${
            activeTab === "pitstop-single"
              ? "text-red-600 border-b-2 border-red-600"
              : "text-gray-500 dark:text-gray-400"
          }`}
          onClick={() => setActiveTab("pitstop-single")}
        >
          Pit Stop (Single)
        </button>
        <button
          className={`flex-1 py-2 font-medium ${
            activeTab === "pitstop-oneMan"
              ? "text-red-600 border-b-2 border-red-600"
              : "text-gray-500 dark:text-gray-400"
          }`}
          onClick={() => setActiveTab("pitstop-oneMan")}
        >
          Pit Stop (One Man)
        </button>
      </div>

      {loading ? (
        <div className="p-4 text-center">
          <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>Loading leaderboard...</p>
        </div>
      ) : error ? (
        <div className="p-4 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      ) : scores.length === 0 ? (
        <div className="p-4 text-center">
          <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>No scores yet. Be the first!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className={isDarkMode ? "bg-gray-700" : "bg-gray-50"}>
                <th className={`px-4 py-2 text-left ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Rank</th>
                <th className={`px-4 py-2 text-left ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Name</th>
                <th className={`px-4 py-2 text-left ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Time</th>
                <th className={`px-4 py-2 text-left ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Date</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`${
                    isDarkMode
                      ? index % 2 === 0
                        ? "bg-gray-800"
                        : "bg-gray-750"
                      : index % 2 === 0
                        ? "bg-white"
                        : "bg-gray-50"
                  }`}
                >
                  <td className={`px-4 py-2 ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>{index + 1}</td>
                  <td className={`px-4 py-2 ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>{score.name}</td>
                  <td className={`px-4 py-2 font-mono ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>
                    {formatTime(score.reaction_ms || score.time)}
                  </td>
                  <td className={`px-4 py-2 ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>
                    {formatDate(score.created_at || score.date)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
