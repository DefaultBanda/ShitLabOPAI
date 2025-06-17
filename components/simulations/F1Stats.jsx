"use client"

import { useEffect, useState } from "react"

export default function F1Stats() {
  const [upcoming, setUpcoming] = useState([])
  const [results, setResults] = useState([])
  const [pits, setPits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const year = new Date().getFullYear()
        const sessionsRes = await fetch(`https://api.openf1.org/v1/sessions?year=${year}`)
        const sessions = await sessionsRes.json()
        const now = Date.now()
        const past = sessions.filter((s) => new Date(s.date_start).getTime() < now)
        const upcomingSessions = sessions.filter((s) => new Date(s.date_start).getTime() >= now)
        setUpcoming(upcomingSessions.slice(0, 5))
        if (past.length) {
          const latest = past[past.length - 1]
          const resRes = await fetch(`https://api.openf1.org/v1/results?session_key=${latest.session_key}`)
          const resData = await resRes.json()
          setResults(resData)
          const pitRes = await fetch(`https://api.openf1.org/v1/pit?session_key=${latest.session_key}`)
          const pitData = await pitRes.json()
          setPits(pitData)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const renderTyres = (driverNum) => {
    const stints = pits.filter((p) => p.driver_number === driverNum)
    if (!stints.length) return "-"
    return stints.map((s) => `${s.compound}:${s.lap_start}-${s.lap_end}`).join(", ")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-6">F1 Stats</h1>
      {loading && <p className="text-center">Loading...</p>}
      {!loading && (
        <>
          <h2 className="text-2xl font-semibold mb-2">Upcoming Sessions</h2>
          <table className="min-w-full mb-6 text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-2 py-1 text-left">Event</th>
                <th className="px-2 py-1 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((s) => (
                <tr key={s.session_key} className="border-b">
                  <td className="px-2 py-1">{s.name}</td>
                  <td className="px-2 py-1">{new Date(s.date_start).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="text-2xl font-semibold mb-2">Latest Race Results</h2>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-2 py-1 text-left">Pos</th>
                <th className="px-2 py-1 text-left">Driver</th>
                <th className="px-2 py-1 text-left">Time</th>
                <th className="px-2 py-1 text-left">Tyres</th>
              </tr>
            </thead>
            <tbody>
              {results.slice(0, 20).map((r) => (
                <tr key={r.position} className="border-b">
                  <td className="px-2 py-1">{r.position}</td>
                  <td className="px-2 py-1">{r.driver_name}</td>
                  <td className="px-2 py-1">{r.time}</td>
                  <td className="px-2 py-1">{renderTyres(r.driver_number)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

