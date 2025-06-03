"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import SliderRow from "../ui/SliderRow"

export default function BlackHoleSimulation() {
  const canvasRef = useRef(null)
  const requestRef = useRef(null)
  const ballsRef = useRef([])
  const [ballCount, setBallCount] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [settings, setSettings] = useState({
    // Basic settings
    maxBalls: 500,
    initialBalls: 10,
    ballRadius: 8,
    containerRadius: 200,
    splitChance: 0.3, // Chance of splitting when hitting wall
    gravity: 0.1,
    friction: 0.02,
    bounce: 0.8,
    colorOptions: ["#FF5733", "#33FF57", "#3357FF", "#F3FF33", "#FF33F3", "#33FFF3"],

    // Advanced settings
    useRealPhysics: false,
    collisionEnabled: true,
    ballDensity: 1.0,
    airResistance: 0.01,
    temperature: 1.0, // Controls random motion
    attractionForce: 0,
    repulsionForce: 0,
    showVelocityVectors: false,
    showCollisions: true,
    showBoundary: true,
  })
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Initialize the simulation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (!container) return

      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }

    // Check for dark mode preference
    if (typeof window !== "undefined") {
      const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDarkMode(darkModePreference)

      // Add listener for changes
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e) => setIsDarkMode(e.matches)
      mediaQuery.addEventListener("change", handleChange)

      return () => mediaQuery.removeEventListener("change", handleChange)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(requestRef.current)
    }
  }, [])

  // Start/stop simulation
  const toggleSimulation = () => {
    if (isRunning) {
      // Stop simulation
      cancelAnimationFrame(requestRef.current)
      setIsRunning(false)
    } else {
      // Start simulation
      setIsRunning(true)

      // Initialize balls if first start
      if (ballsRef.current.length === 0) {
        initializeBalls()
      }

      // Start animation loop
      requestRef.current = requestAnimationFrame(updateSimulation)
    }
  }

  // Reset simulation
  const resetSimulation = () => {
    cancelAnimationFrame(requestRef.current)
    ballsRef.current = []
    setBallCount(0)
    setIsRunning(false)
  }

  // Initialize balls
  const initializeBalls = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const { initialBalls, ballRadius, containerRadius } = settings

    ballsRef.current = []

    for (let i = 0; i < initialBalls; i++) {
      addNewBall(canvas, ballRadius, containerRadius)
    }

    setBallCount(initialBalls)
  }

  // Add a new ball
  const addNewBall = (canvas, ballRadius, containerRadius, parentBall = null) => {
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    let x, y, vx, vy, radius

    if (parentBall) {
      // Split from parent ball with slight variation
      x = parentBall.x
      y = parentBall.y

      // Smaller radius for child balls
      radius = Math.max(ballRadius * 0.7, parentBall.radius * 0.8)

      // Velocity based on parent with some randomness
      const angle = Math.random() * Math.PI * 2
      const speed = Math.sqrt(parentBall.vx * parentBall.vx + parentBall.vy * parentBall.vy)
      vx = Math.cos(angle) * speed * 1.2
      vy = Math.sin(angle) * speed * 1.2
    } else {
      // Random position within container
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * (containerRadius - ballRadius * 2)

      x = centerX + Math.cos(angle) * distance
      y = centerY + Math.sin(angle) * distance

      radius = ballRadius + Math.random() * ballRadius * 0.5

      // Random velocity
      vx = (Math.random() - 0.5) * 4
      vy = (Math.random() - 0.5) * 4
    }

    const color = settings.colorOptions[Math.floor(Math.random() * settings.colorOptions.length)]

    // Calculate mass based on radius and density
    const mass = Math.PI * radius * radius * settings.ballDensity

    const ball = {
      x,
      y,
      vx,
      vy,
      radius,
      color,
      mass,
      lastCollision: 0, // Time of last collision to prevent multiple collisions
      colliding: false, // Flag for collision animation
    }

    ballsRef.current.push(ball)
    return ball
  }

  // Check collision between two balls
  const checkBallCollision = (ball1, ball2) => {
    const dx = ball2.x - ball1.x
    const dy = ball2.y - ball1.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    return distance < ball1.radius + ball2.radius
  }

  // Resolve collision between two balls
  const resolveBallCollision = (ball1, ball2) => {
    const dx = ball2.x - ball1.x
    const dy = ball2.y - ball1.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Normal vector
    const nx = dx / distance
    const ny = dy / distance

    // Minimum translation distance
    const mtd = (ball1.radius + ball2.radius - distance) / 2

    // Move balls apart
    ball1.x -= nx * mtd
    ball1.y -= ny * mtd
    ball2.x += nx * mtd
    ball2.y += ny * mtd

    // Relative velocity
    const dvx = ball2.vx - ball1.vx
    const dvy = ball2.vy - ball1.vy

    // Normal velocity
    const vnorm = dvx * nx + dvy * ny

    // Don't resolve if balls are moving away from each other
    if (vnorm > 0) return

    // Impulse
    const impulse = (2 * vnorm) / (ball1.mass + ball2.mass)

    // Apply impulse
    ball1.vx += impulse * ball2.mass * nx * settings.bounce
    ball1.vy += impulse * ball2.mass * ny * settings.bounce
    ball2.vx -= impulse * ball1.mass * nx * settings.bounce
    ball2.vy -= impulse * ball1.mass * ny * settings.bounce

    // Mark as colliding for visual effect
    ball1.colliding = true
    ball2.colliding = true

    // Set collision time
    const now = performance.now()
    ball1.lastCollision = now
    ball2.lastCollision = now
  }

  // Check and resolve collision with container
  const checkContainerCollision = (ball, centerX, centerY, containerRadius, canvas) => {
    const dx = ball.x - centerX
    const dy = ball.y - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const direction = Math.atan2(dy, dx)

    if (distance + ball.radius > containerRadius) {
      // Ball is outside container, move it back
      ball.x = centerX + Math.cos(direction) * (containerRadius - ball.radius)
      ball.y = centerY + Math.sin(direction) * (containerRadius - ball.radius)

      // Reflect velocity
      const normalX = Math.cos(direction)
      const normalY = Math.sin(direction)

      // Dot product of velocity and normal
      const dot = ball.vx * normalX + ball.vy * normalY

      // Reflect velocity
      ball.vx = (ball.vx - 2 * dot * normalX) * settings.bounce
      ball.vy = (ball.vy - 2 * dot * normalY) * settings.bounce

      // Mark as colliding for visual effect
      ball.colliding = true

      // Chance to split
      if (
        Math.random() < settings.splitChance &&
        ballsRef.current.length < settings.maxBalls &&
        ball.radius > settings.ballRadius * 0.7
      ) {
        // Create a new ball
        addNewBall(canvas, settings.ballRadius, settings.containerRadius, ball)

        // Reduce parent ball size
        ball.radius *= 0.9
        ball.mass = Math.PI * ball.radius * ball.radius * settings.ballDensity
      }

      return true
    }

    return false
  }

  // Apply forces to balls
  const applyForces = (ball, centerX, centerY) => {
    // Gravity
    ball.vy += settings.gravity

    // Friction/drag
    ball.vx *= 1 - settings.friction
    ball.vy *= 1 - settings.friction

    // Air resistance (proportional to velocity squared)
    if (settings.useRealPhysics) {
      const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
      if (speed > 0) {
        const dragForce = settings.airResistance * speed * speed
        ball.vx -= ((ball.vx / speed) * dragForce) / ball.mass
        ball.vy -= ((ball.vy / speed) * dragForce) / ball.mass
      }
    }

    // Random motion (temperature)
    if (settings.temperature > 0) {
      ball.vx += (Math.random() - 0.5) * settings.temperature * 0.1
      ball.vy += (Math.random() - 0.5) * settings.temperature * 0.1
    }

    // Attraction/repulsion to center
    if (settings.attractionForce !== 0 || settings.repulsionForce !== 0) {
      const dx = centerX - ball.x
      const dy = centerY - ball.y
      const distSq = dx * dx + dy * dy

      if (distSq > 0) {
        const dist = Math.sqrt(distSq)
        const force = settings.attractionForce / dist - settings.repulsionForce / (dist * dist)

        ball.vx += (dx / dist) * force
        ball.vy += (dy / dist) * force
      }
    }
  }

  // Update simulation
  const updateSimulation = () => {
    const canvas = canvasRef.current
    if (!canvas) {
      if (isRunning) {
        requestRef.current = requestAnimationFrame(updateSimulation)
      }
      return
    }

    const ctx = canvas.getContext("2d")
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const { containerRadius, showVelocityVectors, showCollisions, showBoundary, collisionEnabled } = settings

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw container
    if (showBoundary) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, containerRadius, 0, Math.PI * 2)
      ctx.strokeStyle = isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Update ball positions and check for collisions
    const now = performance.now()

    // First update positions
    for (let i = 0; i < ballsRef.current.length; i++) {
      const ball = ballsRef.current[i]

      // Apply forces
      applyForces(ball, centerX, centerY)

      // Update position
      ball.x += ball.vx
      ball.y += ball.vy

      // Check container collision
      checkContainerCollision(ball, centerX, centerY, containerRadius, canvas)

      // Reset collision flag if enough time has passed
      if (now - ball.lastCollision > 200) {
        ball.colliding = false
      }
    }

    // Then check ball-ball collisions
    if (collisionEnabled) {
      for (let i = 0; i < ballsRef.current.length; i++) {
        for (let j = i + 1; j < ballsRef.current.length; j++) {
          if (checkBallCollision(ballsRef.current[i], ballsRef.current[j])) {
            resolveBallCollision(ballsRef.current[i], ballsRef.current[j])
          }
        }
      }
    }

    // Draw balls
    for (let i = 0; i < ballsRef.current.length; i++) {
      const ball = ballsRef.current[i]

      // Draw ball
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)

      // Use normal color or highlight if colliding
      if (ball.colliding && showCollisions) {
        ctx.fillStyle = "#FFFFFF"
      } else {
        ctx.fillStyle = ball.color
      }

      ctx.fill()

      // Draw velocity vector
      if (showVelocityVectors) {
        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
        const vectorLength = speed * 5

        ctx.beginPath()
        ctx.moveTo(ball.x, ball.y)
        ctx.lineTo(ball.x + ball.vx * 5, ball.y + ball.vy * 5)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)"
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }

    // Update ball count
    setBallCount(ballsRef.current.length)

    // Continue animation loop if running
    if (isRunning) {
      requestRef.current = requestAnimationFrame(updateSimulation)
    }
  }

  // Handle settings change
  const handleSettingChange = (setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }))
  }

  return (
    <div
      className={`w-full h-full flex flex-col ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}
    >
      <div className={`flex justify-between items-center p-4 ${isDarkMode ? "bg-gray-800" : "bg-gray-200"}`}>
        <h2 className="text-xl font-bold">Ball Physics Simulation</h2>
        <div className="flex items-center space-x-4">
          <div className="text-lg">
            Balls: <span className="font-mono">{ballCount}</span>
          </div>
          <button
            onClick={toggleSimulation}
            className={`px-4 py-2 rounded-md font-medium ${
              isRunning ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
            } text-white`}
          >
            {isRunning ? "Stop" : "Start"}
          </button>
          <button
            onClick={resetSimulation}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md font-medium text-white"
          >
            Reset
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`px-4 py-2 rounded-md font-medium ${
              isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"
            }`}
          >
            {showSettings ? "Hide Settings" : "Show Settings"}
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`absolute top-4 left-4 p-4 rounded-lg shadow-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} w-72 max-h-[80vh] overflow-y-auto`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Simulation Settings</h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="advanced-toggle"
                  checked={showAdvanced}
                  onChange={() => setShowAdvanced(!showAdvanced)}
                  className="mr-2"
                />
                <label htmlFor="advanced-toggle" className="text-sm">
                  Advanced
                </label>
              </div>
            </div>

            <div className="space-y-4">
              {/* Basic Settings */}
              <div className="space-y-3">
                <SliderRow
                  label="Initial Balls"
                  value={settings.initialBalls}
                  min={1}
                  max={50}
                  step={1}
                  onChange={(value) => handleSettingChange("initialBalls", value)}
                />

                <SliderRow
                  label="Max Balls"
                  value={settings.maxBalls}
                  min={50}
                  max={1000}
                  step={10}
                  onChange={(value) => handleSettingChange("maxBalls", value)}
                />

                <SliderRow
                  label="Ball Size"
                  value={settings.ballRadius}
                  min={2}
                  max={20}
                  step={1}
                  onChange={(value) => handleSettingChange("ballRadius", value)}
                />

                <SliderRow
                  label="Container Size"
                  value={settings.containerRadius}
                  min={100}
                  max={400}
                  step={10}
                  onChange={(value) => handleSettingChange("containerRadius", value)}
                />

                <SliderRow
                  label="Split Chance"
                  value={settings.splitChance}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(value) => handleSettingChange("splitChance", value)}
                />

                <SliderRow
                  label="Gravity"
                  value={settings.gravity}
                  min={0}
                  max={0.5}
                  step={0.01}
                  onChange={(value) => handleSettingChange("gravity", value)}
                />

                <SliderRow
                  label="Friction"
                  value={settings.friction}
                  min={0}
                  max={0.1}
                  step={0.005}
                  onChange={(value) => handleSettingChange("friction", value)}
                />

                <SliderRow
                  label="Bounce"
                  value={settings.bounce}
                  min={0.1}
                  max={1}
                  step={0.05}
                  onChange={(value) => handleSettingChange("bounce", value)}
                />
              </div>

              {/* Advanced Settings */}
              {showAdvanced && (
                <div className="pt-2 border-t border-gray-700 space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="real-physics"
                      checked={settings.useRealPhysics}
                      onChange={(e) => handleSettingChange("useRealPhysics", e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="real-physics" className="text-sm">
                      Use Real Physics
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="collision-enabled"
                      checked={settings.collisionEnabled}
                      onChange={(e) => handleSettingChange("collisionEnabled", e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="collision-enabled" className="text-sm">
                      Enable Collisions
                    </label>
                  </div>

                  <SliderRow
                    label="Ball Density"
                    value={settings.ballDensity}
                    min={0.1}
                    max={5}
                    step={0.1}
                    onChange={(value) => handleSettingChange("ballDensity", value)}
                    disabled={!settings.useRealPhysics}
                  />

                  <SliderRow
                    label="Air Resistance"
                    value={settings.airResistance}
                    min={0}
                    max={0.05}
                    step={0.001}
                    onChange={(value) => handleSettingChange("airResistance", value)}
                    disabled={!settings.useRealPhysics}
                  />

                  <SliderRow
                    label="Temperature"
                    value={settings.temperature}
                    min={0}
                    max={5}
                    step={0.1}
                    onChange={(value) => handleSettingChange("temperature", value)}
                  />

                  <SliderRow
                    label="Attraction Force"
                    value={settings.attractionForce}
                    min={0}
                    max={0.5}
                    step={0.01}
                    onChange={(value) => handleSettingChange("attractionForce", value)}
                  />

                  <SliderRow
                    label="Repulsion Force"
                    value={settings.repulsionForce}
                    min={0}
                    max={0.5}
                    step={0.01}
                    onChange={(value) => handleSettingChange("repulsionForce", value)}
                  />

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="show-vectors"
                      checked={settings.showVelocityVectors}
                      onChange={(e) => handleSettingChange("showVelocityVectors", e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="show-vectors" className="text-sm">
                      Show Velocity Vectors
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="show-collisions"
                      checked={settings.showCollisions}
                      onChange={(e) => handleSettingChange("showCollisions", e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="show-collisions" className="text-sm">
                      Show Collisions
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="show-boundary"
                      checked={settings.showBoundary}
                      onChange={(e) => handleSettingChange("showBoundary", e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="show-boundary" className="text-sm">
                      Show Boundary
                    </label>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <div
          className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 ${
            isDarkMode ? "bg-black bg-opacity-70" : "bg-white bg-opacity-70"
          } px-4 py-2 rounded-md`}
        >
          <p className="text-center">
            Balls in simulation: <span className="font-bold">{ballCount}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
