"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Enhanced SliderRow component with editable values
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
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
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

export default function BouncingBall() {
  const canvasRef = useRef(null)
  const [isAnimating, setIsAnimating] = useState(true)

  // Physics parameters with realistic defaults
  const [gravity, setGravity] = useState(9.8) // m/s²
  const [elasticity, setElasticity] = useState(0.7) // Coefficient of restitution
  const [friction, setFriction] = useState(0.98) // Surface friction
  const [airResistance, setAirResistance] = useState(0.001) // Drag coefficient
  const [ballSize, setBallSize] = useState(20) // Radius in pixels
  const [ballMass, setBallMass] = useState(1) // Mass in kg
  const [initialVelocity, setInitialVelocity] = useState(2) // m/s

  // Simulation scale factor (pixels per meter)
  const SCALE = 50

  // Ball state
  const [showTrail, setShowTrail] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showEnergy, setShowEnergy] = useState(false)

  // Energy tracking
  const [potentialEnergy, setPotentialEnergy] = useState(0)
  const [kineticEnergy, setKineticEnergy] = useState(0)
  const [totalEnergy, setTotalEnergy] = useState(0)

  // Reset function
  const resetBall = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      ballRef.current = {
        x: canvas.width / 2,
        y: 50,
        radius: ballSize,
        dx: (initialVelocity * SCALE) / 60, // Convert to pixels per frame
        dy: 0,
        trail: [],
        initialY: 50,
      }
    }
  }

  // Ball reference to maintain state between renders
  const ballRef = useRef({
    x: 0,
    y: 0,
    radius: ballSize,
    dx: (initialVelocity * SCALE) / 60,
    dy: 0,
    trail: [],
    initialY: 50,
  })

  // Reset ball when parameters change
  useEffect(() => {
    resetBall()
  }, [ballSize, initialVelocity])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    let animationId

    // Initialize ball position if not set
    if (ballRef.current.x === 0) {
      resetBall()
    }

    // Update ball radius if changed
    ballRef.current.radius = ballSize

    function drawBall(x, y, radius, alpha = 1) {
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)

      // Create gradient for ball
      const gradient = ctx.createRadialGradient(x - radius / 3, y - radius / 3, 0, x, y, radius)
      gradient.addColorStop(0, "#60a5fa")
      gradient.addColorStop(1, "#2563eb")

      ctx.fillStyle = gradient
      ctx.fill()
      ctx.closePath()
      ctx.globalAlpha = 1
    }

    function drawGround() {
      ctx.beginPath()
      ctx.rect(0, canvas.height - 20, canvas.width, 20)
      ctx.fillStyle = "#d1d5db"
      ctx.fill()
      ctx.closePath()

      // Draw ruler marks
      ctx.fillStyle = "#6b7280"
      for (let x = 0; x < canvas.width; x += SCALE) {
        const height = x % (SCALE * 5) === 0 ? 10 : 5
        ctx.fillRect(x, canvas.height - 20, 1, height)

        // Add labels every 5 meters
        if (x % (SCALE * 5) === 0) {
          ctx.fillText(`${x / SCALE}m`, x - 10, canvas.height - 5)
        }
      }
    }

    function drawTrail() {
      if (!showTrail || ballRef.current.trail.length < 2) return

      // Draw trail
      const trail = ballRef.current.trail
      for (let i = 0; i < trail.length; i++) {
        const point = trail[i]
        const alpha = i / trail.length // Fade out older points
        drawBall(point.x, point.y, ballSize * 0.7 * alpha, alpha * 0.3)
      }
    }

    function drawVelocityVector() {
      const ball = ballRef.current
      const vectorScale = 5 // Scale factor for vector visualization

      // Calculate real-world velocity (pixels per frame to m/s)
      const vx = (ball.dx * 60) / SCALE
      const vy = (ball.dy * 60) / SCALE
      const speed = Math.sqrt(vx * vx + vy * vy)

      ctx.beginPath()
      ctx.moveTo(ball.x, ball.y)
      ctx.lineTo(ball.x + ball.dx * vectorScale, ball.y + ball.dy * vectorScale)
      ctx.strokeStyle = "#ef4444"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw arrowhead
      const angle = Math.atan2(ball.dy, ball.dx)
      const headLength = 10
      const headAngle = Math.PI / 6

      ctx.beginPath()
      ctx.moveTo(ball.x + ball.dx * vectorScale, ball.y + ball.dy * vectorScale)
      ctx.lineTo(
        ball.x + ball.dx * vectorScale - headLength * Math.cos(angle - headAngle),
        ball.y + ball.dy * vectorScale - headLength * Math.sin(angle - headAngle),
      )
      ctx.lineTo(
        ball.x + ball.dx * vectorScale - headLength * Math.cos(angle + headAngle),
        ball.y + ball.dy * vectorScale - headLength * Math.sin(angle + headAngle),
      )
      ctx.closePath()
      ctx.fillStyle = "#ef4444"
      ctx.fill()

      // Display velocity value
      ctx.fillStyle = "#ef4444"
      ctx.font = "12px Arial"
      ctx.fillText(`${speed.toFixed(2)} m/s`, ball.x + ball.dx * vectorScale + 5, ball.y + ball.dy * vectorScale - 5)
    }

    function drawEnergyInfo() {
      if (!showEnergy) return

      const ball = ballRef.current
      const groundY = canvas.height - 20

      // Calculate height from ground in meters
      const height = (groundY - ball.radius - ball.y) / SCALE

      // Calculate velocities in m/s
      const vx = (ball.dx * 60) / SCALE
      const vy = (ball.dy * 60) / SCALE
      const v = Math.sqrt(vx * vx + vy * vy)

      // Calculate energies
      const pe = ballMass * gravity * height
      const ke = 0.5 * ballMass * v * v
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
      const maxEnergy =
        ballMass * gravity * (ball.initialY / SCALE) + 0.5 * ballMass * (initialVelocity * initialVelocity)

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

    function animate() {
      if (!isAnimating) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const ball = ballRef.current
      const dt = 1 / 60 // Time step (assuming 60 FPS)
      const groundY = canvas.height - 20

      // Draw trail first (behind the ball)
      drawTrail()

      // Draw ground
      drawGround()

      // Draw energy information
      drawEnergyInfo()

      // Draw ball
      drawBall(ball.x, ball.y, ball.radius)

      // Draw velocity vector
      if (showAdvanced) {
        drawVelocityVector()
      }

      // Apply gravity (scaled to pixels per frame²)
      ball.dy += gravity * SCALE * dt * dt

      // Apply air resistance (proportional to velocity squared)
      const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy)
      if (speed > 0) {
        const dragX = airResistance * ball.dx * speed
        const dragY = airResistance * ball.dy * speed
        ball.dx -= dragX
        ball.dy -= dragY
      }

      // Update position
      ball.x += ball.dx
      ball.y += ball.dy

      // Add to trail
      if (showTrail) {
        ball.trail.push({ x: ball.x, y: ball.y })
        // Limit trail length
        if (ball.trail.length > 30) {
          ball.trail.shift()
        }
      } else {
        ball.trail = []
      }

      // Wall collision (left/right)
      if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius
        ball.dx = -ball.dx * elasticity
      } else if (ball.x - ball.radius < 0) {
        ball.x = ball.radius
        ball.dx = -ball.dx * elasticity
      }

      // Floor collision
      if (ball.y + ball.radius > groundY) {
        ball.y = groundY - ball.radius
        ball.dy = -ball.dy * elasticity

        // Apply horizontal friction when hitting the ground
        ball.dx *= friction

        // Stop very small movements to prevent endless tiny bounces
        if (Math.abs(ball.dy) < 0.2) {
          ball.dy = 0
        }
      }

      // Ceiling collision
      if (ball.y - ball.radius < 0) {
        ball.y = ball.radius
        ball.dy = -ball.dy * elasticity
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [
    isAnimating,
    gravity,
    elasticity,
    friction,
    airResistance,
    ballSize,
    ballMass,
    showTrail,
    showAdvanced,
    showEnergy,
    initialVelocity,
  ])

  return (
    <motion.div
      className="w-full max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <motion.h2
          className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Bouncing Ball Simulator
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
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
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

            <SliderRow label="Gravity" value={gravity} min={1} max={20} step={0.1} onChange={setGravity} unit=" m/s²" />

            <SliderRow label="Elasticity" value={elasticity} min={0} max={1} step={0.01} onChange={setElasticity} />

            <SliderRow label="Ball Size" value={ballSize} min={5} max={50} step={1} onChange={setBallSize} unit=" px" />

            <SliderRow
              label="Initial Velocity"
              value={initialVelocity}
              min={0}
              max={10}
              step={0.1}
              onChange={setInitialVelocity}
              unit=" m/s"
            />
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

                <SliderRow
                  label="Mass"
                  value={ballMass}
                  min={0.1}
                  max={10}
                  step={0.1}
                  onChange={setBallMass}
                  unit=" kg"
                />

                <SliderRow label="Friction" value={friction} min={0.8} max={1} step={0.01} onChange={setFriction} />

                <SliderRow
                  label="Air Resistance"
                  value={airResistance}
                  min={0}
                  max={0.01}
                  step={0.0001}
                  onChange={setAirResistance}
                />

                <div className="flex flex-col space-y-2 mt-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="trail-toggle"
                      checked={showTrail}
                      onChange={() => setShowTrail(!showTrail)}
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="trail-toggle" className="text-sm font-medium">
                      Show Motion Trail
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="energy-toggle"
                      checked={showEnergy}
                      onChange={() => setShowEnergy(!showEnergy)}
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
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
                      <div className="font-mono">{potentialEnergy.toFixed(2)} J</div>

                      <div>
                        <span className="text-blue-500">●</span> Kinetic:
                      </div>
                      <div className="font-mono">{kineticEnergy.toFixed(2)} J</div>

                      <div>
                        <span className="text-purple-500">●</span> Total:
                      </div>
                      <div className="font-mono">{totalEnergy.toFixed(2)} J</div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Control buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={() => setIsAnimating(!isAnimating)}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-400 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {isAnimating ? "Pause" : "Resume"}
            </motion.button>

            <motion.button
              onClick={resetBall}
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
                  <span className="font-medium">Gravity:</span> Earth's gravity is 9.8 m/s² (acceleration downward)
                </li>
                <li>
                  <span className="font-medium">Elasticity:</span> Perfect elasticity (1.0) means no energy loss on
                  collision
                </li>
                <li>
                  <span className="font-medium">Friction:</span> Horizontal speed reduction when the ball contacts the
                  ground
                </li>
                <li>
                  <span className="font-medium">Air Resistance:</span> Drag force proportional to velocity squared (F =
                  -kv²)
                </li>
                <li>
                  <span className="font-medium">Energy:</span> Total energy = Potential energy (mgh) + Kinetic energy
                  (½mv²)
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
