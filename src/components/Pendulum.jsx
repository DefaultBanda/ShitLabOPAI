"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Enhanced SliderRow component with editable values (same as in BouncingBall)
const SliderRow = ({ label, value, min, max, step, onChange, unit = "" }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(value.toString())
  const inputRef = useRef(null)

  // Handle click on the value to enable editing
  const handleValueClick = () => {
    setInputValue(value.toString())
    setIsEditing(true)
    // Focus the input after it appears
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }, 10)
  }

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  // Handle input blur or Enter key
  const handleInputBlur = () => {
    applyValue()
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      applyValue()
    } else if (e.key === "Escape") {
      setIsEditing(false)
    }
  }

  // Apply the new value
  const applyValue = () => {
    const newValue = Number.parseFloat(inputValue)
    if (!isNaN(newValue)) {
      onChange(newValue)
    }
    setIsEditing(false)
  }

  return (
    <div className="mb-3">
      <label className="flex justify-between items-center text-sm mb-1">
        <span className="font-medium">{label}</span>
        {isEditing ? (
          <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              className="w-16 bg-transparent font-mono text-right focus:outline-none"
              aria-label={`Edit ${label}`}
            />
            <span className="ml-1">{unit}</span>
          </div>
        ) : (
          <motion.span
            key={value}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={handleValueClick}
            title="Click to edit"
          >
            {value}
            {unit}
          </motion.span>
        )}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(Math.max(value, min), max)} // Clamp value to slider range
        onChange={(e) => onChange(Number.parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
        aria-label={label}
      />
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  )
}

export default function Pendulum() {
  const canvasRef = useRef(null)
  const [isAnimating, setIsAnimating] = useState(true)

  // Physics parameters with realistic defaults
  const [length, setLength] = useState(1.0) // Length in meters
  const [gravity, setGravity] = useState(9.8) // m/s²
  const [damping, setDamping] = useState(0.05) // Damping coefficient
  const [mass, setMass] = useState(1.0) // Mass in kg
  const [initialAngle, setInitialAngle] = useState(45) // Initial angle in degrees

  // Simulation scale factor (pixels per meter)
  const SCALE = 150

  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showTrail, setShowTrail] = useState(false)
  const [showPhaseSpace, setShowPhaseSpace] = useState(false)
  const [showEnergy, setShowEnergy] = useState(false)

  // Energy tracking
  const [potentialEnergy, setPotentialEnergy] = useState(0)
  const [kineticEnergy, setKineticEnergy] = useState(0)
  const [totalEnergy, setTotalEnergy] = useState(0)

  // Period calculation
  const [period, setPeriod] = useState(0)

  // Pendulum state reference
  const pendulumRef = useRef({
    angle: (initialAngle * Math.PI) / 180, // Convert to radians
    angularVelocity: 0,
    trail: [],
    phaseTrail: [],
    time: 0,
    lastUpdate: 0,
  })

  // Reset function
  const resetPendulum = () => {
    pendulumRef.current = {
      angle: (initialAngle * Math.PI) / 180, // Convert to radians
      angularVelocity: 0,
      trail: [],
      phaseTrail: [],
      time: 0,
      lastUpdate: 0,
    }

    // Calculate theoretical period (small angle approximation)
    const theoreticalPeriod = 2 * Math.PI * Math.sqrt(length / gravity)
    setPeriod(theoreticalPeriod)
  }

  // Reset pendulum when parameters change
  useEffect(() => {
    resetPendulum()
  }, [length, gravity, initialAngle])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    let animationId

    // Initialize pendulum if not set
    if (pendulumRef.current.lastUpdate === 0) {
      resetPendulum()
    }

    function drawPendulum(x, y, angle, bobRadius = 20) {
      const pivotX = canvas.width / 2
      const pivotY = 100

      // Calculate bob position
      const bobX = pivotX + Math.sin(angle) * length * SCALE
      const bobY = pivotY + Math.cos(angle) * length * SCALE

      // Draw rod
      ctx.beginPath()
      ctx.moveTo(pivotX, pivotY)
      ctx.lineTo(bobX, bobY)
      ctx.strokeStyle = "#6b7280"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw pivot
      ctx.beginPath()
      ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2)
      ctx.fillStyle = "#4b5563"
      ctx.fill()

      // Draw bob
      ctx.beginPath()
      ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2)

      // Create gradient for bob
      const gradient = ctx.createRadialGradient(bobX - bobRadius / 3, bobY - bobRadius / 3, 0, bobX, bobY, bobRadius)
      gradient.addColorStop(0, "#a78bfa")
      gradient.addColorStop(1, "#7c3aed")

      ctx.fillStyle = gradient
      ctx.fill()

      // Return bob position for other functions
      return { x: bobX, y: bobY }
    }

    function drawTrail(trail) {
      if (!showTrail || trail.length < 2) return

      ctx.beginPath()
      ctx.moveTo(trail[0].x, trail[0].y)

      for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(trail[i].x, trail[i].y)
      }

      // Create gradient for trail
      const gradient = ctx.createLinearGradient(
        trail[0].x,
        trail[0].y,
        trail[trail.length - 1].x,
        trail[trail.length - 1].y,
      )
      gradient.addColorStop(0, "rgba(167, 139, 250, 0.1)")
      gradient.addColorStop(1, "rgba(124, 58, 237, 0.5)")

      ctx.strokeStyle = gradient
      ctx.lineWidth = 2
      ctx.stroke()
    }

    function drawPhaseSpace(phaseTrail) {
      if (!showPhaseSpace || phaseTrail.length < 2) return

      const centerX = canvas.width - 120
      const centerY = 120
      const radius = 80

      // Draw phase space background
      ctx.fillStyle = "rgba(243, 244, 246, 0.7)"
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fill()

      // Draw axes
      ctx.strokeStyle = "#9ca3af"
      ctx.lineWidth = 1

      // Horizontal axis (angle)
      ctx.beginPath()
      ctx.moveTo(centerX - radius, centerY)
      ctx.lineTo(centerX + radius, centerY)
      ctx.stroke()

      // Vertical axis (angular velocity)
      ctx.beginPath()
      ctx.moveTo(centerX, centerY - radius)
      ctx.lineTo(centerX, centerY + radius)
      ctx.stroke()

      // Draw phase trajectory
      ctx.beginPath()

      for (let i = 0; i < phaseTrail.length; i++) {
        const x = centerX + (phaseTrail[i].angle / (Math.PI / 2)) * radius * 0.8
        const y = centerY - (phaseTrail[i].velocity / 5) * radius * 0.8

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.strokeStyle = "rgba(124, 58, 237, 0.8)"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw labels
      ctx.fillStyle = "#4b5563"
      ctx.font = "10px Arial"
      ctx.fillText("Angle", centerX + radius - 30, centerY + 15)
      ctx.fillText("Angular", centerX - 60, centerY - radius + 15)
      ctx.fillText("Velocity", centerX - 60, centerY - radius + 25)

      // Draw current point
      const currentX = centerX + (pendulumRef.current.angle / (Math.PI / 2)) * radius * 0.8
      const currentY = centerY - (pendulumRef.current.angularVelocity / 5) * radius * 0.8

      ctx.beginPath()
      ctx.arc(currentX, currentY, 4, 0, Math.PI * 2)
      ctx.fillStyle = "#7c3aed"
      ctx.fill()
    }

    function drawEnergyInfo() {
      if (!showEnergy) return

      // Calculate energies
      const pendulum = pendulumRef.current
      const h = length * (1 - Math.cos(pendulum.angle)) // Height from equilibrium
      const v = length * pendulum.angularVelocity // Tangential velocity

      const pe = mass * gravity * h
      const ke = 0.5 * mass * v * v
      const te = pe + ke

      // Update state (less frequently to avoid performance issues)
      if (Math.random() < 0.1) {
        setPotentialEnergy(pe)
        setKineticEnergy(ke)
        setTotalEnergy(te)
      }

      // Draw energy bars
      const barWidth = 100
      const barHeight = 15
      const x = 20
      const y = 20

      // Max energy for scaling (based on initial conditions)
      const initialH = length * (1 - Math.cos((initialAngle * Math.PI) / 180))
      const maxEnergy = mass * gravity * initialH

      // Draw background bars
      ctx.fillStyle = "#f3f4f6"
      ctx.fillRect(x, y, barWidth, barHeight)
      ctx.fillRect(x, y + barHeight + 5, barWidth, barHeight)
      ctx.fillRect(x, y + (barHeight + 5) * 2, barWidth, barHeight)

      // Draw energy bars
      ctx.fillStyle = "#10b981" // Potential energy (green)
      ctx.fillRect(x, y, (pe / maxEnergy) * barWidth, barHeight)

      ctx.fillStyle = "#3b82f6" // Kinetic energy (blue)
      ctx.fillRect(x, y + barHeight + 5, (ke / maxEnergy) * barWidth, barHeight)

      ctx.fillStyle = "#8b5cf6" // Total energy (purple)
      ctx.fillRect(x, y + (barHeight + 5) * 2, (te / maxEnergy) * barWidth, barHeight)

      // Labels
      ctx.fillStyle = "#000000"
      ctx.font = "10px Arial"
      ctx.fillText("PE", x + barWidth + 5, y + barHeight - 3)
      ctx.fillText("KE", x + barWidth + 5, y + barHeight * 2 + 2)
      ctx.fillText("TE", x + barWidth + 5, y + barHeight * 3 + 7)
    }

    function drawPeriodInfo() {
      // Draw period information
      ctx.fillStyle = "#4b5563"
      ctx.font = "12px Arial"
      ctx.fillText(`Period: ${period.toFixed(2)} seconds`, canvas.width - 150, canvas.height - 20)
    }

    function animate(timestamp) {
      if (!isAnimating) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const pendulum = pendulumRef.current

      // Calculate time delta
      let dt = 0
      if (pendulum.lastUpdate) {
        dt = (timestamp - pendulum.lastUpdate) / 1000 // Convert to seconds
      }
      pendulum.lastUpdate = timestamp

      // Limit dt to avoid instability
      dt = Math.min(dt, 1 / 30)

      // Update physics (using Euler method)
      // Equation of motion: θ'' = -(g/L)sin(θ) - (b/m)θ'
      const angularAcceleration =
        -(gravity / length) * Math.sin(pendulum.angle) - (damping / mass) * pendulum.angularVelocity

      pendulum.angularVelocity += angularAcceleration * dt
      pendulum.angle += pendulum.angularVelocity * dt
      pendulum.time += dt

      // Draw trail first (behind pendulum)
      const bobPosition = drawPendulum(canvas.width / 2, 100, pendulum.angle)

      // Update trail
      if (showTrail) {
        pendulum.trail.push({ x: bobPosition.x, y: bobPosition.y })
        // Limit trail length
        if (pendulum.trail.length > 100) {
          pendulum.trail.shift()
        }
      } else {
        pendulum.trail = []
      }

      // Update phase space trail
      if (showPhaseSpace) {
        pendulum.phaseTrail.push({
          angle: pendulum.angle,
          velocity: pendulum.angularVelocity,
        })
        // Limit phase trail length
        if (pendulum.phaseTrail.length > 200) {
          pendulum.phaseTrail.shift()
        }
      } else {
        pendulum.phaseTrail = []
      }

      // Draw trail
      drawTrail(pendulum.trail)

      // Draw phase space
      drawPhaseSpace(pendulum.phaseTrail)

      // Draw energy information
      drawEnergyInfo()

      // Draw period information
      drawPeriodInfo()

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [isAnimating, length, gravity, damping, mass, initialAngle, showTrail, showPhaseSpace, showEnergy])

  return (
    <motion.div
      className="w-full max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <motion.h2
          className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-indigo-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Pendulum Simulator
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showAdvanced}
              onChange={() => setShowAdvanced(!showAdvanced)}
              className="sr-only peer"
              aria-label="Show Advanced Options"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            <span className="ml-3 text-sm font-medium">Advanced Options</span>
          </label>
        </motion.div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Controls panel */}
        <motion.div
          className="w-full lg:w-1/3 space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Basic Parameters</h3>

            <SliderRow label="Length" value={length} min={0.1} max={3} step={0.1} onChange={setLength} unit=" m" />

            <SliderRow
              label="Initial Angle"
              value={initialAngle}
              min={5}
              max={90}
              step={1}
              onChange={setInitialAngle}
              unit="°"
            />

            <SliderRow label="Gravity" value={gravity} min={1} max={20} step={0.1} onChange={setGravity} unit=" m/s²" />
          </div>

          {/* Advanced options */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Advanced Parameters</h3>

                <SliderRow label="Mass" value={mass} min={0.1} max={5} step={0.1} onChange={setMass} unit=" kg" />

                <SliderRow label="Damping" value={damping} min={0} max={0.5} step={0.01} onChange={setDamping} />

                <div className="flex flex-col space-y-2 mt-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="trail-toggle"
                      checked={showTrail}
                      onChange={() => setShowTrail(!showTrail)}
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="trail-toggle" className="text-sm font-medium">
                      Show Motion Trail
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="phase-toggle"
                      checked={showPhaseSpace}
                      onChange={() => setShowPhaseSpace(!showPhaseSpace)}
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="phase-toggle" className="text-sm font-medium">
                      Show Phase Space
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="energy-toggle"
                      checked={showEnergy}
                      onChange={() => setShowEnergy(!showEnergy)}
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="energy-toggle" className="text-sm font-medium">
                      Show Energy Visualization
                    </label>
                  </div>
                </div>

                {/* Energy display */}
                {showEnergy && (
                  <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Energy (Joules)</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-green-500">●</span> Potential:
                      </div>
                      <div className="font-mono">{potentialEnergy.toFixed(3)} J</div>

                      <div>
                        <span className="text-blue-500">●</span> Kinetic:
                      </div>
                      <div className="font-mono">{kineticEnergy.toFixed(3)} J</div>

                      <div>
                        <span className="text-purple-500">●</span> Total:
                      </div>
                      <div className="font-mono">{totalEnergy.toFixed(3)} J</div>
                    </div>
                  </div>
                )}

                {/* Period information */}
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Pendulum Period</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>T = 2π√(L/g)</div>
                    <div className="font-mono">T = {period.toFixed(3)} seconds</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Control buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={() => setIsAnimating(!isAnimating)}
              className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-400 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {isAnimating ? "Pause" : "Resume"}
            </motion.button>

            <motion.button
              onClick={resetPendulum}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Reset
            </motion.button>
          </div>
        </motion.div>

        {/* Canvas container */}
        <motion.div
          className="w-full lg:w-2/3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
            <canvas
              ref={canvasRef}
              width={800}
              height={400}
              className="w-full h-auto border border-gray-300 dark:border-gray-700 rounded-xl shadow-inner dark:bg-gray-900"
            />

            {/* Physics explanation */}
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              <h3 className="font-semibold mb-2">Physics Explained:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <span className="font-medium">Simple Pendulum:</span> A mass suspended from a pivot that can swing
                  freely
                </li>
                <li>
                  <span className="font-medium">Period:</span> Time for one complete oscillation, T = 2π√(L/g) for small
                  angles
                </li>
                <li>
                  <span className="font-medium">Damping:</span> Energy loss due to air resistance and friction
                </li>
                <li>
                  <span className="font-medium">Phase Space:</span> Plot of angle vs. angular velocity showing the
                  system's evolution
                </li>
                <li>
                  <span className="font-medium">Energy:</span> Transfers between potential (height) and kinetic (motion)
                  energy
                </li>
              </ul>
              <p className="mt-2 text-xs italic">
                Click on any value to enter a custom number beyond the slider limits.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
