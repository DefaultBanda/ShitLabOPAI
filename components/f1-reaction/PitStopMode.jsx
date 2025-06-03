"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { saveScore } from "@/utils/leaderboard"
import { isProfane } from "@/utils/profanityFilter"

// F1 teams with their pit stop quality ratings
const F1_TEAMS = [
  { name: "Red Bull Racing", quality: 0.95, color: "#0600EF" },
  { name: "McLaren", quality: 0.9, color: "#FF8700" },
  { name: "Ferrari", quality: 0.85, color: "#DC0000" },
  { name: "Mercedes", quality: 0.8, color: "#00D2BE" },
  { name: "Aston Martin", quality: 0.75, color: "#006F62" },
  { name: "Alpine", quality: 0.7, color: "#0090FF" },
  { name: "Williams", quality: 0.65, color: "#005AFF" },
  { name: "RB", quality: 0.6, color: "#1E41FF" },
  { name: "Sauber", quality: 0.55, color: "#900000" },
  { name: "Haas F1", quality: 0.5, color: "#FFFFFF" },
]

export default function PitStopMode({ onBack, nickname, isDarkMode }) {
  const [gameState, setGameState] = useState("ready") // ready, pitstop, result
  const [gameMode, setGameMode] = useState("single") // single, oneMan
  const [selectedRole, setSelectedRole] = useState("gunner") // gunner, jack
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [totalTime, setTotalTime] = useState(null)
  const [bestTime, setBestTime] = useState({
    single: null,
    oneMan: null,
  })
  const [carLifted, setCarLifted] = useState(false)
  const [tires, setTires] = useState({
    FL: { removed: false, installed: false, error: false, inProgress: false },
    FR: { removed: false, installed: false, error: false, inProgress: false },
    RL: { removed: false, installed: false, error: false, inProgress: false },
    RR: { removed: false, installed: false, error: false, inProgress: false },
  })
  const [elapsedTime, setElapsedTime] = useState(0)
  const [rating, setRating] = useState({ title: "", description: "" })
  const [playerNickname, setPlayerNickname] = useState(nickname || "")
  const [nicknameError, setNicknameError] = useState("")
  const [timerActive, setTimerActive] = useState(false)
  const [errorChance, setErrorChance] = useState(0.1) // 10% chance of error by default
  const [selectedTeam, setSelectedTeam] = useState(F1_TEAMS[0]) // Default to Red Bull

  const timerRef = useRef(null)
  const aiTimersRef = useRef([])
  const completionCheckRef = useRef(false)

  // Load best times from localStorage
  useEffect(() => {
    const savedSingleBestTime = localStorage.getItem("f1-pitstop-single-best-time")
    const savedOneManBestTime = localStorage.getItem("f1-pitstop-oneman-best-time")

    setBestTime({
      single: savedSingleBestTime ? Number.parseFloat(savedSingleBestTime) : null,
      oneMan: savedOneManBestTime ? Number.parseFloat(savedOneManBestTime) : null,
    })

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // Clear all AI timers
      aiTimersRef.current.forEach((timer) => clearTimeout(timer))
    }
  }, [])

  // Start the game
  const startGame = () => {
    setGameState("pitstop")
    setCarLifted(false)
    setTires({
      FL: { removed: false, installed: false, error: false, inProgress: false },
      FR: { removed: false, installed: false, error: false, inProgress: false },
      RL: { removed: false, installed: false, error: false, inProgress: false },
      RR: { removed: false, installed: false, error: false, inProgress: false },
    })
    setTimerActive(false)
    setElapsedTime(0)
    setStartTime(null)
    setEndTime(null)
    completionCheckRef.current = false

    // Clear any existing AI timers
    aiTimersRef.current.forEach((timer) => clearTimeout(timer))
    aiTimersRef.current = []
  }

  // Handle tire click
  const handleTireClick = (tire) => {
    if (gameState !== "pitstop") return

    // In single role mode with gunner selected, can only interact with tires
    if (gameMode === "single" && selectedRole === "gunner") {
      // In single role as gunner, only handle FL tire
      if (tire !== "FL") return
    }

    // In single role mode with jack selected, can't interact with tires
    if (gameMode === "single" && selectedRole === "jack") {
      return
    }

    // Check if car is lifted (required for tire operations)
    if (!carLifted) return

    // Check if tire is already in progress
    if (tires[tire].inProgress) return

    const currentTire = tires[tire]

    // If tire has an error, fix it
    if (currentTire.error) {
      setTires((prev) => ({
        ...prev,
        [tire]: { ...prev[tire], error: false },
      }))
      return
    }

    // If tire is not removed yet, remove it
    if (!currentTire.removed) {
      setTires((prev) => ({
        ...prev,
        [tire]: { ...prev[tire], removed: true },
      }))
    }
    // If tire is removed but not installed, install it
    else if (currentTire.removed && !currentTire.installed) {
      setTires((prev) => ({
        ...prev,
        [tire]: { ...prev[tire], installed: true },
      }))

      // Check if all required tires are done
      checkPitStopCompletion()
    }
  }

  // Handle car lift/lower
  const handleCarAction = () => {
    if (gameState !== "pitstop") return

    // In single role mode with gunner selected, can't lift/lower car
    if (gameMode === "single" && selectedRole === "gunner") {
      return
    }

    // If lowering the car, check if all tires are installed
    if (carLifted) {
      const allTiresInstalled = Object.values(tires).every((tire) => tire.installed)
      const anyTireInProgress = Object.values(tires).some((tire) => tire.inProgress)
      const anyTireError = Object.values(tires).some((tire) => tire.error)

      // In jack mode, all tires must be installed before lowering
      if (
        gameMode === "single" &&
        selectedRole === "jack" &&
        (!allTiresInstalled || anyTireInProgress || anyTireError)
      ) {
        return
      }

      // In one man army mode, all tires must be installed before lowering
      if (gameMode === "oneMan" && (!allTiresInstalled || anyTireInProgress || anyTireError)) {
        return
      }
    }

    // Toggle car lifted state
    const newLiftedState = !carLifted
    setCarLifted(newLiftedState)

    // Start timer when car is lifted
    if (newLiftedState && !timerActive) {
      const now = performance.now()
      setStartTime(now)
      setTimerActive(true)

      // Start the timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      timerRef.current = setInterval(() => {
        setElapsedTime(performance.now() - now)
      }, 10)

      // If in single role mode as jack, start AI tire changes
      if (gameMode === "single" && selectedRole === "jack") {
        simulateAITireChanges()
      }
    }

    // If lowering the car, check if pit stop is complete
    if (!newLiftedState && timerActive) {
      checkPitStopCompletion()
    }
  }

  // Simulate AI tire changes in single role mode
  const simulateAITireChanges = () => {
    // Clear any existing AI timers
    aiTimersRef.current.forEach((timer) => clearTimeout(timer))
    aiTimersRef.current = []

    // In jack mode, simulate all 4 tires being changed
    const tiresToChange = ["FL", "FR", "RL", "RR"]

    tiresToChange.forEach((tire) => {
      // Mark tire as in progress
      setTires((prev) => ({
        ...prev,
        [tire]: { ...prev[tire], inProgress: true },
      }))

      // Calculate time based on team quality
      // Better teams (higher quality) have faster and more consistent pit stops
      const baseTime = 1500 // Base time in ms
      const teamQualityFactor = selectedTeam.quality // 0.5 (worst) to 0.95 (best)
      const randomVariation = Math.random() * 1000 // Random variation up to 1s

      // Calculate times for removal and installation
      // Better teams have less random variation and faster base times
      const removeTime = baseTime * (1 - teamQualityFactor) + randomVariation * (1 - teamQualityFactor)
      const installTime = baseTime * (1 - teamQualityFactor) + randomVariation * (1 - teamQualityFactor)

      // Calculate error chance based on team quality
      // Better teams have fewer errors
      const teamErrorChance = errorChance * (1 - teamQualityFactor) * 2
      const hasError = Math.random() < teamErrorChance

      // Remove tire
      const removeTimer = setTimeout(() => {
        setTires((prev) => ({
          ...prev,
          [tire]: { ...prev[tire], removed: true },
        }))

        // Install tire after delay
        const installTimer = setTimeout(() => {
          if (hasError) {
            // Simulate error
            setTires((prev) => ({
              ...prev,
              [tire]: { ...prev[tire], error: true, inProgress: false },
            }))
          } else {
            // Successfully install
            setTires((prev) => ({
              ...prev,
              [tire]: { removed: true, installed: true, error: false, inProgress: false },
            }))
          }
        }, installTime)

        aiTimersRef.current.push(installTimer)
      }, removeTime)

      aiTimersRef.current.push(removeTimer)
    })
  }

  // Check if pit stop is complete
  const checkPitStopCompletion = () => {
    if (completionCheckRef.current) return

    // For single role mode
    if (gameMode === "single") {
      if (selectedRole === "gunner") {
        // Gunner needs to change FL tire
        if (tires.FL.installed) {
          // Simulate jack man lowering the car after tire is installed
          const timer = setTimeout(() => {
            setCarLifted(false)
            finishPitStop()
          }, 500)

          aiTimersRef.current.push(timer)
        }
      } else if (selectedRole === "jack") {
        // Jack man needs to lower the car after all tires are changed
        const allTiresInstalled = Object.values(tires).every((tire) => tire.installed)
        const anyTireInProgress = Object.values(tires).some((tire) => tire.inProgress)
        const anyTireError = Object.values(tires).some((tire) => tire.error)

        if (!carLifted && allTiresInstalled && !anyTireInProgress && !anyTireError) {
          finishPitStop()
        }
      }
    }
    // For one man army mode
    else if (gameMode === "oneMan") {
      // Check if all tires are installed and car is lowered
      const allTiresInstalled = Object.values(tires).every((tire) => tire.installed)
      if (allTiresInstalled && !carLifted) {
        finishPitStop()
      }
    }
  }

  // Finish the pit stop
  const finishPitStop = () => {
    if (completionCheckRef.current) return
    completionCheckRef.current = true

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    const now = performance.now()
    const time = startTime ? (now - startTime) / 1000 : 0
    setEndTime(now)
    setTotalTime(time)
    setTimerActive(false)

    // Update best time if needed
    const bestTimeKey = gameMode === "single" ? "single" : "oneMan"
    if (!bestTime[bestTimeKey] || time < bestTime[bestTimeKey]) {
      setBestTime((prev) => ({
        ...prev,
        [bestTimeKey]: time,
      }))
      localStorage.setItem(`f1-pitstop-${bestTimeKey}-best-time`, time.toString())
    }

    // Get rating
    const newRating = getF1PitStopRating(time, gameMode)
    setRating(newRating)

    setGameState("result")
  }

  // Simulate AI actions in single role mode
  useEffect(() => {
    if (gameState !== "pitstop" || gameMode !== "single") return

    // If player is gunner, simulate jack man
    if (selectedRole === "gunner" && !carLifted) {
      // Jack man lifts the car after a short delay
      const timer = setTimeout(() => {
        setCarLifted(true)
        const now = performance.now()
        setStartTime(now)
        setTimerActive(true)

        // Start the timer
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }

        timerRef.current = setInterval(() => {
          setElapsedTime(performance.now() - now)
        }, 10)
      }, 1000)

      aiTimersRef.current.push(timer)
    }
  }, [gameState, gameMode, selectedRole, carLifted])

  // Get F1-themed pit stop rating with realistic descriptions
  const getF1PitStopRating = (time, mode) => {
    // Different thresholds based on mode
    const thresholds = mode === "single" ? [1.8, 2.2, 2.5, 3.0, 3.5, 4.0] : [3.0, 4.0, 5.0, 6.0, 7.0, 8.0]

    if (time < thresholds[0])
      return {
        title: "World Record!",
        description: "McLaren Qatar GP 2023 level! Lando would be proud.",
      }
    if (time < thresholds[1])
      return {
        title: "Red Bull Pit Crew!",
        description: "Christian Horner wants your number. Verstappen would be impressed.",
      }
    if (time < thresholds[2])
      return {
        title: "Top Team Material!",
        description: "Ferrari would hire you in a heartbeat. Leclerc would be delighted.",
      }
    if (time < thresholds[3])
      return {
        title: "Solid Pit Stop",
        description: "Mercedes level efficiency. Hamilton would approve.",
      }
    if (time < thresholds[4])
      return {
        title: "Midfield Team",
        description: "Alpine level. Solid but room for improvement.",
      }
    if (time < thresholds[5])
      return {
        title: "Back Marker Team",
        description: "Haas would call this 'according to plan'. Not bad for a rookie.",
      }
    return {
      title: "Still Learning",
      description: "Everyone starts somewhere. Keep practicing!",
    }
  }

  // Format time in 00.000 format
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000)
    const milliseconds = Math.floor(ms % 1000)
    return `${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`
  }

  // Try again
  const tryAgain = () => {
    setGameState("ready")
    setTotalTime(null)
    setElapsedTime(0)
    completionCheckRef.current = false
  }

  // Save score to leaderboard
  const saveToLeaderboard = () => {
    if (!playerNickname.trim()) {
      setNicknameError("Please enter a nickname")
      return
    }

    if (isProfane(playerNickname)) {
      setNicknameError("Really? Please use appropriate language.")
      return
    }

    setNicknameError("")

    // Save to leaderboard
    saveScore(playerNickname, totalTime * 1000, `pitstop-${gameMode}`)
      .then(() => {
        // Navigate back to menu after saving
        if (typeof onBack === "function") {
          onBack()
        } else {
          console.log("Score saved, but onBack is not a function")
          setGameState("ready")
        }
      })
      .catch((error) => {
        console.error("Error saving score:", error)
        setNicknameError("Failed to save score. Please try again.")
      })
  }

  // Get wheel status
  const getTireStatus = (tire) => {
    if (tires[tire].error) return "error"
    if (tires[tire].inProgress) return "inProgress"
    if (tires[tire].installed) return "installed"
    if (tires[tire].removed) return "removed"
    return "original"
  }

  // Effect to check completion when tires change
  useEffect(() => {
    if (gameState === "pitstop" && timerActive) {
      checkPitStopCompletion()
    }
  }, [tires, carLifted, gameState, timerActive])

  return (
    <motion.div
      key="pitstop-mode"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-black dark:bg-gray-900 rounded-xl p-6 shadow-md mb-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Pit Stop Mode</h2>

        {gameState === "ready" && (
          <div className="text-center">
            <p className="mb-6 text-gray-400">
              Complete a Formula 1 pit stop as quickly as possible! The current F1 pit stop record is 1.80s by McLaren
              at the 2023 Qatar Grand Prix!
            </p>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-3">Select Mode</h3>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <motion.div
                  className={`
                    p-4 rounded-lg cursor-pointer border-2 
                    ${
                      gameMode === "single"
                        ? "border-blue-500 bg-blue-900 bg-opacity-30"
                        : "border-gray-700 hover:border-blue-500"
                    }
                  `}
                  onClick={() => setGameMode("single")}
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className="text-lg font-semibold text-white mb-2">Single Role</h4>
                  <p className="text-gray-400 text-sm">You play as one pit crew member. AI handles the rest.</p>
                  {bestTime.single && <p className="text-green-500 mt-2">Best: {formatTime(bestTime.single * 1000)}</p>}
                </motion.div>

                <motion.div
                  className={`
                    p-4 rounded-lg cursor-pointer border-2 
                    ${
                      gameMode === "oneMan"
                        ? "border-red-500 bg-red-900 bg-opacity-30"
                        : "border-gray-700 hover:border-red-500"
                    }
                  `}
                  onClick={() => setGameMode("oneMan")}
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className="text-lg font-semibold text-white mb-2">One Man Army</h4>
                  <p className="text-gray-400 text-sm">You do everything yourself. Change all 4 tires!</p>
                  {bestTime.oneMan && <p className="text-green-500 mt-2">Best: {formatTime(bestTime.oneMan * 1000)}</p>}
                </motion.div>
              </div>
            </div>

            {gameMode === "single" && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">Select Your Role</h3>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <motion.div
                    className={`
                      p-4 rounded-lg cursor-pointer border-2 
                      ${
                        selectedRole === "gunner"
                          ? "border-yellow-500 bg-yellow-900 bg-opacity-30"
                          : "border-gray-700 hover:border-yellow-500"
                      }
                    `}
                    onClick={() => setSelectedRole("gunner")}
                    whileHover={{ scale: 1.02 }}
                  >
                    <h4 className="text-lg font-semibold text-white mb-2">Tire Gunner</h4>
                    <p className="text-gray-400 text-sm">Change the front left tire</p>
                  </motion.div>

                  <motion.div
                    className={`
                      p-4 rounded-lg cursor-pointer border-2 
                      ${
                        selectedRole === "jack"
                          ? "border-yellow-500 bg-yellow-900 bg-opacity-30"
                          : "border-gray-700 hover:border-yellow-500"
                      }
                    `}
                    onClick={() => setSelectedRole("jack")}
                    whileHover={{ scale: 1.02 }}
                  >
                    <h4 className="text-lg font-semibold text-white mb-2">Jack Man</h4>
                    <p className="text-gray-400 text-sm">Lift and lower the car</p>
                  </motion.div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-3">Select Team</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                {F1_TEAMS.map((team) => (
                  <div
                    key={team.name}
                    className={`p-2 rounded cursor-pointer border ${
                      selectedTeam.name === team.name
                        ? "border-yellow-500 bg-yellow-900 bg-opacity-30"
                        : "border-gray-700 hover:border-gray-500"
                    }`}
                    onClick={() => setSelectedTeam(team)}
                    style={{ borderColor: team.color }}
                  >
                    <div className="text-xs text-center text-white">{team.name}</div>
                  </div>
                ))}
              </div>
              <p className="text-gray-400 text-sm">
                Team Quality: <span className="font-bold">{Math.round(selectedTeam.quality * 100)}%</span>
                <br />
                <span className="text-xs">(Higher quality teams have faster pit stops and fewer errors)</span>
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-3">Difficulty</h3>
              <div className="flex justify-center items-center">
                <label className="text-gray-400 mr-2">Error Chance:</label>
                <select
                  value={errorChance}
                  onChange={(e) => setErrorChance(Number.parseFloat(e.target.value))}
                  className="bg-gray-800 text-white rounded px-2 py-1"
                >
                  <option value="0">None (0%)</option>
                  <option value="0.05">Low (5%)</option>
                  <option value="0.1">Medium (10%)</option>
                  <option value="0.2">High (20%)</option>
                </select>
              </div>
            </div>

            <motion.button
              onClick={startGame}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Pit Stop
            </motion.button>
          </div>
        )}

        {gameState === "pitstop" && (
          <div className="flex flex-col items-center">
            {/* Timer display */}
            <div className="mb-4 text-center">
              <p className="text-4xl font-mono font-bold text-white">{formatTime(elapsedTime)}</p>
            </div>

            {/* Current role */}
            <div className="mb-4 text-center">
              <p className="text-lg text-blue-400">
                Your Role:{" "}
                <span className="font-bold">
                  {gameMode === "single"
                    ? selectedRole === "gunner"
                      ? "Front Left Gunner"
                      : "Jack Man"
                    : "One Man Army"}
                </span>
              </p>
              <p className="text-sm" style={{ color: selectedTeam.color }}>
                Team: {selectedTeam.name}
              </p>
            </div>

            {/* Car visualization */}
            <div className="w-full max-w-md relative mb-6">
              <div
                className={`
                bg-gray-800 p-4 rounded-lg relative transition-transform duration-300
                ${carLifted ? "transform -translate-y-2" : ""}
              `}
              >
                {/* Simple F1 car outline */}
                <div className="w-full h-24 bg-red-600 rounded-lg relative">
                  {/* Cockpit */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-black rounded-full"></div>

                  {/* Front wing */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-32 h-2 bg-gray-300 rounded"></div>

                  {/* Rear wing */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-gray-300 rounded"></div>

                  {/* Wheels - now clickable */}
                  <motion.div
                    className={`absolute -top-1 -left-2 w-8 h-8 rounded-full border-4 border-gray-800 
                      ${
                        getTireStatus("FL") === "original"
                          ? "bg-gray-700"
                          : getTireStatus("FL") === "removed"
                            ? "bg-red-600"
                            : getTireStatus("FL") === "installed"
                              ? "bg-green-600"
                              : getTireStatus("FL") === "error"
                                ? "bg-yellow-500"
                                : "bg-blue-500 animate-pulse"
                      }
                      ${gameMode === "oneMan" || (gameMode === "single" && selectedRole === "gunner") ? "cursor-pointer" : ""}
                    `}
                    onClick={() => handleTireClick("FL")}
                    whileHover={
                      carLifted && (gameMode === "oneMan" || (gameMode === "single" && selectedRole === "gunner"))
                        ? { scale: 1.1 }
                        : {}
                    }
                  ></motion.div>

                  <motion.div
                    className={`absolute -top-1 -right-2 w-8 h-8 rounded-full border-4 border-gray-800 
                      ${
                        getTireStatus("FR") === "original"
                          ? "bg-gray-700"
                          : getTireStatus("FR") === "removed"
                            ? "bg-red-600"
                            : getTireStatus("FR") === "installed"
                              ? "bg-green-600"
                              : getTireStatus("FR") === "error"
                                ? "bg-yellow-500"
                                : "bg-blue-500 animate-pulse"
                      }
                      ${gameMode === "oneMan" ? "cursor-pointer" : ""}
                    `}
                    onClick={() => gameMode === "oneMan" && handleTireClick("FR")}
                    whileHover={carLifted && gameMode === "oneMan" ? { scale: 1.1 } : {}}
                  ></motion.div>

                  <motion.div
                    className={`absolute -bottom-1 -left-2 w-8 h-8 rounded-full border-4 border-gray-800 
                      ${
                        getTireStatus("RL") === "original"
                          ? "bg-gray-700"
                          : getTireStatus("RL") === "removed"
                            ? "bg-red-600"
                            : getTireStatus("RL") === "installed"
                              ? "bg-green-600"
                              : getTireStatus("RL") === "error"
                                ? "bg-yellow-500"
                                : "bg-blue-500 animate-pulse"
                      }
                      ${gameMode === "oneMan" ? "cursor-pointer" : ""}
                    `}
                    onClick={() => gameMode === "oneMan" && handleTireClick("RL")}
                    whileHover={carLifted && gameMode === "oneMan" ? { scale: 1.1 } : {}}
                  ></motion.div>

                  <motion.div
                    className={`absolute -bottom-1 -right-2 w-8 h-8 rounded-full border-4 border-gray-800 
                      ${
                        getTireStatus("RR") === "original"
                          ? "bg-gray-700"
                          : getTireStatus("RR") === "removed"
                            ? "bg-red-600"
                            : getTireStatus("RR") === "installed"
                              ? "bg-green-600"
                              : getTireStatus("RR") === "error"
                                ? "bg-yellow-500"
                                : "bg-blue-500 animate-pulse"
                      }
                      ${gameMode === "oneMan" ? "cursor-pointer" : ""}
                    `}
                    onClick={() => gameMode === "oneMan" && handleTireClick("RR")}
                    whileHover={carLifted && gameMode === "oneMan" ? { scale: 1.1 } : {}}
                  ></motion.div>
                </div>

                {/* Jack under the car */}
                <div
                  className={`
                  absolute bottom-0 left-1/2 transform -translate-x-1/2 
                  w-8 h-${carLifted ? "8" : "4"} bg-yellow-600 transition-all duration-300
                `}
                ></div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 gap-4 w-full max-w-md">
              {/* Jack button - only shown for jack man in single mode or one man army */}
              {(gameMode === "oneMan" || (gameMode === "single" && selectedRole === "jack")) && (
                <motion.button
                  className={`h-16 ${carLifted ? "bg-yellow-600 hover:bg-yellow-700" : "bg-blue-600 hover:bg-blue-700"} text-white font-bold rounded-lg`}
                  onClick={handleCarAction}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {carLifted ? "Lower Car" : "Lift Car"}
                </motion.button>
              )}

              {/* Instructions */}
              <div className="text-center mt-2">
                <p className="text-gray-400">
                  {gameMode === "oneMan"
                    ? "Click on tires to remove/install them. Lift car first! Fix yellow tires if there's an error."
                    : selectedRole === "gunner"
                      ? "Click on the front left tire to remove/install it. Fix yellow tires if there's an error."
                      : "Lift the car, wait for tire changes, then lower it when all tires are green."}
                </p>
              </div>
            </div>

            {/* Wheel status indicators */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-6">
              {["FL", "FR", "RL", "RR"].map((wheel) => {
                const status = getTireStatus(wheel)
                let statusColor = "bg-gray-600"
                let statusText = "Original"

                if (status === "removed") {
                  statusColor = "bg-red-600"
                  statusText = "Removed"
                } else if (status === "installed") {
                  statusColor = "bg-green-600"
                  statusText = "New Tire"
                } else if (status === "error") {
                  statusColor = "bg-yellow-500"
                  statusText = "Error - Fix!"
                } else if (status === "inProgress") {
                  statusColor = "bg-blue-500"
                  statusText = "Changing..."
                }

                return (
                  <div key={wheel} className="flex items-center p-2 rounded-lg bg-gray-800">
                    <div
                      className={`w-4 h-4 rounded-full ${statusColor} mr-2 ${status === "inProgress" ? "animate-pulse" : ""}`}
                    ></div>
                    <span className="text-white">
                      {wheel}: {statusText}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {gameState === "result" && (
          <div className="text-center">
            <div className="mb-6">
              <p className="text-lg font-semibold mb-2 text-gray-300">Your Pit Stop Time</p>
              <p className="text-5xl font-mono font-bold text-green-500 mb-2">{formatTime(totalTime * 1000)}</p>
              <p className="text-2xl font-bold text-blue-500">{rating.title}</p>
              <p className="text-gray-400 mt-2 italic">"{rating.description}"</p>

              {bestTime[gameMode] === totalTime && (
                <motion.p
                  className="mt-2 text-yellow-500 font-bold"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ repeat: 3, duration: 0.3 }}
                >
                  New Best Time!
                </motion.p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Enter your nickname for the leaderboard:</label>
              <input
                type="text"
                value={playerNickname}
                onChange={(e) => setPlayerNickname(e.target.value)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg w-full max-w-xs"
                placeholder="Your nickname"
              />
              {nicknameError && <p className="text-red-500 mt-1">{nicknameError}</p>}
            </div>

            <div className="flex justify-center space-x-4">
              <motion.button
                onClick={saveToLeaderboard}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Save Score
              </motion.button>

              <motion.button
                onClick={tryAgain}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <motion.button
          onClick={() => {
            if (typeof onBack === "function") {
              onBack()
            } else {
              console.log("onBack is not a function")
              // Fallback behavior
              window.history.back()
            }
          }}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Back to Menu
        </motion.button>
      </div>
    </motion.div>
  )
}
