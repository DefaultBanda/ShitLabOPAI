import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for the entire app
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Function to get top scores for a specific mode
export async function getTopScores(mode, limit = 10) {
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
  const { data, error } = await supabase.from("reaction_times").insert([{ name, mode, reaction_ms }])

  if (error) {
    console.error("Error saving score:", error)
    return false
  }

  return true
}
