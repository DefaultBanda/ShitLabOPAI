"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import SliderRow from "../ui/SliderRow"

export default function MagneticMaze() {
  const canvasRef = useRef(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isStarted, setIsStarted] = useState(false)

  // Simulation parameters
  const [initialSpeed, setInitialSpeed] = useState(150)
  const [chargePolarity, setChargePolarity] = useState(1) // 1 for positive, -1 for negative
  const [fieldStrength, setFieldStrength] = useState(2)
  const [showFieldLines, setShowFieldLines] = useState(true)
  const [enableFriction, setEnableFriction] = useState(true)

  // Animation state
  const animationRef = useRef(null)
  const lastTimeRef = useRef(0)
  const stateRef = useRef({
    particle: {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 8,
    },
    exitZone: {
      x: 0,
      y: 0,
      radius: 30,
    },
    magneticFields: [],
    completed: false,
    completionTime: 0,
    attempts: 0,
    successes: 0,
  })

  // Reset function
  const resetSimulation = () => {
    setIsAnimating(false)
    setIsStarted(false)
    initializeSimulation()
  }

  // Start simulation
  const startSimulation = () => {
    if (!isStarted) {
      initializeSimulation()
      setIsStarted(true)
    }
    setIsAnimating(true)
  }

  // Pause simulation
  const pauseSimulation = () => {
    setIsAnimating(false)
  }

  // Initialize simulation
  const initializeSimulation = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const width = canvas.width
    const height = canvas.height

    // Create particle
    const angle = Math.random() * Math.PI * 2
    const particle = {
      x: width * 0.2,
      y: height / 2,
      vx: initialSpeed * Math.cos(angle),
      vy: initialSpeed * Math.sin(angle),
      radius: 8,
    }

    // Create exit zone
    const exitZone = {
      x: width * 0.8,
      y: height / 2,
      radius: 30,
    }

    // Create magnetic fields
    const magneticFields = [
      {
        x: width * 0.5,
        y: height * 0.3,
        strength: fieldStrength * 0.8,
        radius: 80,
      },
      {
        x: width * 0.5,
        y: height * 0.7,
        strength: fieldStrength * 0.8,
        radius: 80,
      },
      {
        x: width * 0.35,
        y: height * 0.5,
        strength: fieldStrength * 0.6,
        radius: 60,
      },
      {
        x: width * 0.65,
        y: height * 0.5,
        strength: fieldStrength * 0.6,
        radius: 60,
      },
    ]

    stateRef.current = {
      particle,
      exitZone,
      magneticFields,
      completed: false,
      completionTime: 0,
      attempts: stateRef.current.attempts || 0,
      successes: stateRef.current.successes || 0,
    }
  }

  // Effect to initialize simulation
  useEffect(() => {
    initializeSimulation()
  }, [initialSpeed, fieldStrength])

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const width = canvas.width
    const height = canvas.height

    // Function to draw the particle
    const drawParticle = (particle) => {
      ctx.save()
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)

      // Create gradient for particle
      const gradient = ctx.createRadialGradient(
        particle.x - particle.radius / 3,
        particle.y - particle.radius / 3,
        0,
        particle.x,
        particle.y,
        particle.radius,
      )

      // Color based on charge polarity
      if (chargePolarity > 0) {
        gradient.addColorStop(0, "#ffffff")
        gradient.addColorStop(1, "#ef4444") // Red for positive
      } else {
        gradient.addColorStop(0, "#ffffff")
        gradient.addColorStop(1, "#3b82f6") // Blue for negative
      }

      ctx.fillStyle = gradient
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
      ctx.shadowBlur = 5
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      ctx.fill()

      // Draw charge symbol
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 10px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(chargePolarity > 0 ? "+" : "−", particle.x, particle.y)

      ctx.restore()
    }

    // Function to draw the exit zone
    const drawExitZone = (exitZone) => {
      ctx.save()
      ctx.beginPath()
      ctx.arc(exitZone.x, exitZone.y, exitZone.radius, 0, Math.PI * 2)

      // Create gradient for exit zone
      const gradient = ctx.createRadialGradient(exitZone.x, exitZone.y, 0, exitZone.x, exitZone.y, exitZone.radius)
      gradient.addColorStop(0, "rgba(16, 185, 129, 0.2)")
      gradient.addColorStop(1, "rgba(16, 185, 129, 0.6)")

      ctx.fillStyle = gradient
      ctx.fill()

      // Draw border
      ctx.strokeStyle = "#10b981"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw label
      ctx.fillStyle = "#10b981"
      ctx.font = "bold 14px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("EXIT", exitZone.x, exitZone.y)

      ctx.restore()
    }

    // Function to draw magnetic fields
    const drawMagneticFields = (fields) => {
      ctx.save()

      fields.forEach((field) => {
        // Draw field area
        ctx.beginPath()
        ctx.arc(field.x, field.y, field.radius, 0, Math.PI * 2)

        // Create gradient for field
        const gradient = ctx.createRadialGradient(field.x, field.y, 0, field.x, field.y, field.radius)
        gradient.addColorStop(0, "rgba(139, 92, 246, 0.1)")
        gradient.addColorStop(1, "rgba(139, 92, 246, 0.3)")

        ctx.fillStyle = gradient
        ctx.fill()

        // Draw border
        ctx.strokeStyle = "rgba(139, 92, 246, 0.6)"
        ctx.lineWidth = 1
        ctx.stroke()

        // Draw field strength indicator
        const strengthIndicator = Math.abs(field.strength) * 10
        ctx.fillStyle = "rgba(139, 92, 246, 0.8)"
        ctx.font = "bold 12px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(`${field.strength.toFixed(1)}T`, field.x, field.y)

        // Draw field lines if enabled
        if (showFieldLines) {
          const numLines = 8
          const lineLength = field.radius * 0.8

          for (let i = 0; i < numLines; i++) {
            const angle = (i / numLines) * Math.PI * 2
            const startX = field.x + field.radius * 0.3 * Math.cos(angle)
            const startY = field.y + field.radius * 0.3 * Math.sin(angle)
            const endX = field.x + lineLength * Math.cos(angle)
            const endY = field.y + lineLength * Math.sin(angle)

            ctx.beginPath()
            ctx.moveTo(startX, startY)
            ctx.lineTo(endX, endY)
            ctx.strokeStyle = "rgba(139, 92, 246, 0.4)"
            ctx.lineWidth = 1
            ctx.stroke()

            // Draw arrowhead
            const arrowSize = 5
            const arrowAngle = Math.atan2(endY - startY, endX - startX)
            ctx.beginPath()
            ctx.moveTo(endX, endY)
            ctx.lineTo(
              endX - arrowSize * Math.cos(arrowAngle - Math.PI / 6),
              endY - arrowSize * Math.sin(arrowAngle - Math.PI / 6),
            )
            ctx.lineTo(
              endX - arrowSize * Math.cos(arrowAngle + Math.PI / 6),
              endY - arrowSize * Math.sin(arrowAngle + Math.PI / 6),
            )
            ctx.closePath()
            ctx.fillStyle = "rgba(139, 92, 246, 0.4)"
            ctx.fill()
          }
        }
      })

      ctx.restore()
    }

    // Function to calculate Lorentz force
    const calculateLorentzForce = (particle, fields) => {
      let totalFx = 0
      let totalFy = 0

      fields.forEach((field) => {
        // Distance from particle to field center
        const dx = particle.x - field.x
        const dy = particle.y - field.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Field strength decreases with distance
        const effectiveStrength = field.strength * Math.max(0, 1 - distance / (field.radius * 1.2))

        if (effectiveStrength > 0) {
          // Lorentz force: F = q(v × B)
          // For 2D, we assume B field is perpendicular to the plane (z-direction)
          // So F_x = q * v_y * B and F_y = -q * v_x * B
          const fx = chargePolarity * particle.vy * effectiveStrength
          const fy = -chargePolarity * particle.vx * effectiveStrength

          totalFx += fx
          totalFy += fy
        }
      })

      return { fx: totalFx, fy: totalFy }
    }

    // Function to check if particle reached exit zone
    const checkExitZoneReached = (particle, exitZone) => {
      const dx = particle.x - exitZone.x
      const dy = particle.y - exitZone.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      return distance <= exitZone.radius + particle.radius
    }

    // Function to check if particle is outside the canvas
    const isOutsideBounds = (particle, width, height) => {
      return (
        particle.x < -particle.radius ||
        particle.x > width + particle.radius ||
        particle.y < -particle.radius ||
        particle.y > height + particle.radius
      )
    }

    // Animation function
    const animate = (timestamp) => {
      if (!isAnimating) return

      // Calculate time delta
      const deltaTime = timestamp - (lastTimeRef.current || timestamp)
      lastTimeRef.current = timestamp

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      const state = stateRef.current
      const { particle, exitZone, magneticFields, completed } = state

      // Draw magnetic fields
      drawMagneticFields(magneticFields)

      // Draw exit zone
      drawExitZone(exitZone)

      // Update particle position if not completed
      if (!completed) {
        // Calculate Lorentz force
        const { fx, fy } = calculateLorentzForce(particle, magneticFields)

        // Update velocity based on force (F = ma, assuming mass = 1)
        particle.vx += (fx * deltaTime) / 1000
        particle.vy += (fy * deltaTime) / 1000

        // Apply friction if enabled
        if (enableFriction) {
          const frictionFactor = 0.98
          particle.vx *= frictionFactor
          particle.vy *= frictionFactor
        }

        // Update position
        particle.x += (particle.vx * deltaTime) / 1000
        particle.y += (particle.vy * deltaTime) / 1000

        // Check if particle reached exit zone
        if (checkExitZoneReached(particle, exitZone)) {
          state.completed = true
          state.completionTime = 0
          state.successes++
        }

        // Check if particle is outside bounds
        if (isOutsideBounds(particle, width, height)) {
          // Reset particle
          state.attempts++
          initializeSimulation()
        }
      } else {
        // Particle reached exit zone, update completion time
        state.completionTime += deltaTime

        // Reset after 2 seconds
        if (state.completionTime > 2000) {
          initializeSimulation()
          state.completed = false
        }
      }

      // Draw particle
      drawParticle(particle)

      // Draw stats
      ctx.save()
      ctx.font = "16px Arial"
      ctx.fillStyle = "#64748b"
      ctx.textAlign = "right"
      ctx.fillText(`Attempts: ${state.attempts}`, width - 20, 30)
      ctx.fillText(`Successes: ${state.successes}`, width - 20, 55)
      ctx.restore()

      // Continue animation
      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation if enabled
    if (isAnimating) {
      animationRef.current = requestAnimationFrame(animate)
    }

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAnimating, chargePolarity, fieldStrength, showFieldLines, enableFriction])

  return (
    <motion.div
      className="w-full max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <motion.h2
          className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-violet-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Magnetic Maze
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center space-x-4">
            <img src="/SimL.png" alt="Physics Lab Logo" className="h-10 w-auto block dark:hidden" />
            <img src="/SimLD.png" alt="Physics Lab Logo" className="h-10 w-auto hidden dark:block" />
          </div>
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
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Simulation Parameters</h3>

            <SliderRow
              label="Initial Speed"
              value={initialSpeed}
              min={50}
              max={300}
              step={10}
              onChange={setInitialSpeed}
              unit=" px/s"
            />

            <SliderRow
              label="Magnetic Field Strength"
              value={fieldStrength}
              min={0}
              max={5}
              step={0.1}
              onChange={setFieldStrength}
              unit=" T"
            />

            <div className="mt-4 mb-2">
              <label className="text-sm font-medium">Charge Polarity</label>
              <div className="flex mt-2 space-x-4">
                <button
                  onClick={() => setChargePolarity(1)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    chargePolarity > 0
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  Positive (+)
                </button>
                <button
                  onClick={() => setChargePolarity(-1)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    chargePolarity < 0
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  Negative (−)
                </button>
              </div>
            </div>

            <div className="flex flex-col space-y-2 mt-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="field-lines"
                  checked={showFieldLines}
                  onChange={() => setShowFieldLines(!showFieldLines)}
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="field-lines" className="text-sm font-medium">
                  Show Field Lines
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="friction"
                  checked={enableFriction}
                  onChange={() => setEnableFriction(!enableFriction)}
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="friction" className="text-sm font-medium">
                  Enable Friction
                </label>
              </div>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={startSimulation}
              className="flex-1 bg-gradient-to-r from-purple-500 to-violet-400 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={isAnimating}
            >
              {isStarted ? "Resume" : "Start"}
            </motion.button>

            <motion.button
              onClick={pauseSimulation}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={!isAnimating}
            >
              Pause
            </motion.button>

            <motion.button
              onClick={resetSimulation}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Reset
            </motion.button>
          </div>

          {/* Stats */}
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Statistics</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Attempts:</div>
              <div className="font-mono">{stateRef.current.attempts}</div>
              <div>Successes:</div>
              <div className="font-mono">{stateRef.current.successes}</div>
              <div>Success Rate:</div>
              <div className="font-mono">
                {stateRef.current.attempts > 0
                  ? `${((stateRef.current.successes / stateRef.current.attempts) * 100).toFixed(1)}%`
                  : "0.0%"}
              </div>
            </div>
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
                  <span className="font-medium">Lorentz Force:</span> A charged particle moving through a magnetic field
                  experiences a force perpendicular to both its velocity and the field (F = q(v × B))
                </li>
                <li>
                  <span className="font-medium">Charge Polarity:</span> Positive and negative charges experience forces
                  in opposite directions in the same magnetic field
                </li>
                <li>
                  <span className="font-medium">Circular Motion:</span> In a uniform magnetic field, charged particles
                  move in circular paths (the basis for cyclotrons and particle accelerators)
                </li>
                <li>
                  <span className="font-medium">Field Strength:</span> Measured in Tesla (T), stronger fields create
                  tighter curves in the particle's path
                </li>
                <li>
                  <span className="font-medium">Applications:</span> This principle is used in mass spectrometers,
                  particle accelerators, and MRI machines
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
