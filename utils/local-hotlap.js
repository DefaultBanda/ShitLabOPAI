// Local leaderboard utilities for Hotlap Showdown

// Get top lap times for a track from localStorage
export function getTopScores(trackId, limit = 10) {
  try {
    const scores = JSON.parse(
      localStorage.getItem(`hotlap-${trackId}-scores`) || "[]"
    )
    return scores.slice(0, limit)
  } catch (e) {
    console.error("Error getting local lap times:", e)
    return []
  }
}

// Save a lap time locally
export function saveLapTime(
  driverName,
  constructorName,
  constructorId,
  trackId,
  lapTime
) {
  if (!driverName || !constructorName || !constructorId || !trackId || !lapTime) {
    console.error("Error saving lap time: Missing required fields")
    return false
  }
  const lapTimeInt = Math.floor(Number(lapTime))
  if (isNaN(lapTimeInt) || lapTimeInt <= 0) {
    console.error("Error saving lap time: Invalid lap time", lapTime)
    return false
  }
  try {
    const scores = JSON.parse(
      localStorage.getItem(`hotlap-${trackId}-scores`) || "[]"
    )
    scores.push({
      driver_name: driverName,
      constructor_name: constructorName,
      constructor_id: constructorId,
      track_id: trackId,
      lap_time: lapTimeInt,
    })
    scores.sort((a, b) => a.lap_time - b.lap_time)
    localStorage.setItem(
      `hotlap-${trackId}-scores`,
      JSON.stringify(scores.slice(0, 10))
    )
    return true
  } catch (e) {
    console.error("Error saving lap time locally:", e)
    return false
  }
}
