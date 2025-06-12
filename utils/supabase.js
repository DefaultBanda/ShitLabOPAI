import { createClient } from "@supabase/supabase-js"

// Create a single Supabase client for the entire app if env vars are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

if (!supabase) {
  console.warn(
    "Supabase disabled: NEXT_PUBLIC_SUPABASE_URL/ANON_KEY environment variables not set"
  )
}

// Function to get top scores for a specific mode
export async function getTopScores(mode, limit = 10) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from("reaction_times")
    .select("*")
    .eq("mode", mode)
    .order("reaction_ms", { ascending: true })
    .limit(limit)

  if (error) {
    console.error("Error fetching leaderboard:", error)
    return []
  }

  return data || []
}

// Function to save a score
export async function saveScore(name, mode, reaction_ms) {
  if (!supabase) return true
  const { data, error } = await supabase
    .from("reaction_times")
    .insert([{ name, mode, reaction_ms }])

  if (error) {
    console.error("Error saving score:", error)
    return false
  }

  return true
}
