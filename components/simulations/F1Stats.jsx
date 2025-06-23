"use client"

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"

const POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]

export default function F1Stats() {
  const [tab, setTab] = useState("sessions")
  const [sessions, setSessions] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [latest, setLatest] = useState(null)
  const [results, setResults] = useState([])
  const [stints, setStints] = useState([])
  const [driverStandings, setDriverStandings] = useState([])
  const [constructorStandings, setConstructorStandings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const year = new Date().getFullYear()
        const sessionsRes = await fetch(`https://api.openf1.org/v1/sessions?year=${year}`)
        const sess = await sessionsRes.json()
        setSessions(sess)

        const now = Date.now()
        const upcomingSessions = sess.filter((s) => new Date(s.date_start).getTime() >= now)
        setUpcoming(upcomingSessions.slice(0, 5))

        const pastRaces = sess.filter(
          (s) => new Date(s.date_start).getTime() < now && s.session_name === "Race"
        )
        const latestRace = pastRaces[pastRaces.length - 1]
        setLatest(latestRace)

        if (latestRace) {
          const resRes = await fetch(`https://api.openf1.org/v1/results?session_key=${latestRace.session_key}`)
          const resData = await resRes.json()
          setResults(resData)
          const stintRes = await fetch(`https://api.openf1.org/v1/stints?session_key=${latestRace.session_key}`)
          const stintData = await stintRes.json()
          setStints(stintData)
        }

        const driverPts = {}
        const teamPts = {}
        for (const race of pastRaces) {
          const res = await fetch(`https://api.openf1.org/v1/results?session_key=${race.session_key}`)
          const raceData = await res.json()
          raceData.forEach((r) => {
            const pts = POINTS[r.position - 1] || 0
            if (!driverPts[r.driver_number]) {
              driverPts[r.driver_number] = { name: r.driver_name, points: 0 }
            }
            driverPts[r.driver_number].points += pts
            if (!teamPts[r.team_name]) {
              teamPts[r.team_name] = { team: r.team_name, points: 0 }
            }
            teamPts[r.team_name].points += pts
          })
        }
        setDriverStandings(Object.values(driverPts).sort((a, b) => b.points - a.points))
        setConstructorStandings(Object.values(teamPts).sort((a, b) => b.points - a.points))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const renderTyres = (driverNum) => {
    const ds = stints.filter((s) => s.driver_number === driverNum)
    if (!ds.length) return "-"
    return ds
      .map((s) => `${s.compound}:${s.lap_start}-${s.lap_end}`)
      .join(", ")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-6">F1 Stats</h1>
      {loading && <p className="text-center">Loading...</p>}
      {!loading && (
        <>
          <div className="flex gap-2 mb-4 justify-center">
            <button
              className={`px-3 py-1 rounded border ${tab === "sessions" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
              onClick={() => setTab("sessions")}
            >
              Sessions
            </button>
            <button
              className={`px-3 py-1 rounded border ${tab === "results" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
              onClick={() => setTab("results")}
            >
              Latest Race
            </button>
            <button
              className={`px-3 py-1 rounded border ${tab === "standings" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
              onClick={() => setTab("standings")}
            >
              Standings
            </button>
          </div>

          {tab === "sessions" && (
            <div>
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
            </div>
          )}

          {tab === "results" && latest && (
            <div>
              <h2 className="text-2xl font-semibold mb-2">{latest.meeting_name}</h2>
              <table className="min-w-full text-sm mb-4">
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
            </div>
          )}

          {tab === "standings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Driver Standings</h2>
                <BarChart width={500} height={300} data={driverStandings.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="points" fill="#8884d8" />
                </BarChart>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Constructor Standings</h2>
                <BarChart width={500} height={300} data={constructorStandings.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="team" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="points" fill="#82ca9d" />
                </BarChart>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

