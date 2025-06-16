import { isProfane } from "./profanityFilter"

// Save score to localStorage
export async function saveScore(name, time, mode) {
  if (!name || time === undefined || !mode) {
    console.error("Missing required parameters for saveScore:", { name, time, mode })
    return Promise.reject(new Error("Missing required parameters"))
  }

  // Filter profanity
  if (isProfane(name)) {
    return Promise.reject(new Error("Inappropriate nickname"))
  }

  // Convert time to milliseconds for storage if it's not already
  const timeMs = Math.round(time)

  try {
    const scores = JSON.parse(localStorage.getItem(`f1-${mode}-scores`) || "[]")
    scores.push({ name, time: timeMs, date: new Date().toISOString() })
    scores.sort((a, b) => a.time - b.time)
    localStorage.setItem(`f1-${mode}-scores`, JSON.stringify(scores.slice(0, 10)))
    return true
  } catch (error) {
    console.error("Error saving score:", error)
    return false
  }
}

// Get scores from localStorage
export async function getScores(mode, limit = 10) {
  try {
    return getLocalScores(mode, limit)
  } catch (error) {
    console.error("Error fetching scores:", error)
    return []
  }
}

// Get local scores (fallback)
export function getLocalScores(mode, limit = 10) {
  try {
    const scores = JSON.parse(localStorage.getItem(`f1-${mode}-scores`) || "[]")
    return scores.slice(0, limit)
  } catch (e) {
    console.error("Error getting local scores:", e)
    return []
  }
}
