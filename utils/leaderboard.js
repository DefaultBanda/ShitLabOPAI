import { supabase } from "./supabase"
import { isProfane } from "./profanityFilter"

// Save score to localStorage and Supabase
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
    // Save to Supabase
    const { data, error } = await supabase.from("reaction_times").insert([
      {
        name: name.trim() || "Anonymous",
        reaction_ms: timeMs,
        mode,
      },
    ])

    if (error) throw error

    // Also save to localStorage as backup
    const scores = JSON.parse(localStorage.getItem(`f1-${mode}-scores`) || "[]")
    scores.push({ name, time: timeMs, date: new Date().toISOString() })
    scores.sort((a, b) => a.time - b.time)
    localStorage.setItem(`f1-${mode}-scores`, JSON.stringify(scores.slice(0, 10)))

    return data
  } catch (error) {
    console.error("Error saving score:", error)

    // Still save to localStorage even if Supabase fails
    try {
      const scores = JSON.parse(localStorage.getItem(`f1-${mode}-scores`) || "[]")
      scores.push({ name: name.trim() || "Anonymous", time: timeMs, date: new Date().toISOString() })
      scores.sort((a, b) => a.time - b.time)
      localStorage.setItem(`f1-${mode}-scores`, JSON.stringify(scores.slice(0, 10)))
    } catch (e) {
      console.error("Error saving to localStorage:", e)
    }

    throw error
  }
}

// Get scores from Supabase
export async function getScores(mode, limit = 10) {
  try {
    const { data, error } = await supabase
      .from("reaction_times")
      .select("*")
      .eq("mode", mode)
      .order("reaction_ms", { ascending: true })
      .limit(limit)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching scores:", error)

    // Fallback to localStorage if Supabase fails
    const scores = getLocalScores(mode, limit)
    return scores
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
