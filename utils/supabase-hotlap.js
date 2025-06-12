import { createClient } from "@supabase/supabase-js"

// Create a dedicated Supabase client for Hotlap Showdown if env vars are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabaseHotlap =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

if (!supabaseHotlap) {
  console.warn(
    "Supabase disabled: NEXT_PUBLIC_SUPABASE_URL/ANON_KEY environment variables not set"
  )
}

// Function to get top scores for a specific track
export async function getTopScores(trackId, limit = 10) {
  if (!supabaseHotlap) return []
  const { data, error } = await supabaseHotlap
    .from("hotlap_leaderboard")
    .select("*")
    .eq("track_id", trackId)
    .order("lap_time", { ascending: true })
    .limit(limit)

  if (error) {
    console.error("Error fetching leaderboard:", error)
    return []
  }

  return data || []
}

// Function to save a lap time
export async function saveLapTime(driverName, constructorName, constructorId, trackId, lapTime) {
  // Validate inputs
  if (!driverName || !constructorName || !constructorId || !trackId || !lapTime) {
    console.error("Error saving lap time: Missing required fields", {
      driverName,
      constructorName,
      constructorId,
      trackId,
      lapTime,
    })
    return false
  }

  // Ensure lap_time is an integer
  const lapTimeInt = Math.floor(Number(lapTime))
  if (isNaN(lapTimeInt) || lapTimeInt <= 0) {
    console.error("Error saving lap time: Invalid lap time", lapTime)
    return false
  }

  if (!supabaseHotlap) return true
  const { data, error } = await supabaseHotlap
    .from("hotlap_leaderboard")
    .insert([
      {
        driver_name: driverName,
        constructor_name: constructorName,
        constructor_id: constructorId,
        track_id: trackId,
        lap_time: lapTimeInt,
      },
    ])

  if (error) {
    console.error("Supabase error saving lap time:", error)
    return false
  }

  return true
}
