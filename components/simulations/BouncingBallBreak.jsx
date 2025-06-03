"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import SliderRow from "../ui/SliderRow"

export default function BouncingBallBreak() {
  const canvasRef = useRef(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isStarted, setIsStarted] = useState(false)

  // Physics parameters
  const [initialSpeed, setInitialSpeed] = useState(150) // px/s
  const [ballSize, setBallSize] = useState(15) // px
  const [maxBalls, setMaxBalls] = useState(30) // maximum number of balls
  const [gravity, setGravity] = useState(false) // gravity toggle
  const [showTraces, setShowTraces] = useState(false) // traces toggle

  // Animation state
  const animationRef = useRef(null)
  const lastTimeRef = useRef(0)
  const ballsRef = useRef([])
  const tracesRef = useRef([])

  // Reset function
  const resetSimulation = () => {
    setIsAnimating(false)
    setIsStarted(false)

    // Create initial ball in the center
    const initialBall = {
      x: 400, // Center x
      y: 200, // Center y
      vx: (Math.random() * 2 - 1) * initialSpeed,
      vy: (Math.random() * 2 - 1) * initialSpeed,
      radius: ballSize,
      color: getRandomColor(),
      breaking: false,
      breakFrame: 0,
    }

    ballsRef.current = [initialBall]
    tracesRef.current = []
  }

  // Start simulation
  const startSimulation = () => {
    if (!isStarted) {
      resetSimulation()
      setIsStarted(true)
    }
    setIsAnimating(true)
  }

  // Pause simulation
  const pauseSimulation = () => {
    setIsAnimating(false)
  }

  // Generate random color for balls
  const getRandomColor = () => {
    const colors = [
      "#3b82f6", // blue
      "#10b981", // green
      "#f97316", // orange
      "#8b5cf6", // purple
      "#ec4899", // pink
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Initialize simulation
  useEffect(() => {
    resetSimulation()
  }, [ballSize, initialSpeed])

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const circleRadius = Math.min(width, height) / 2 - 20

    // Function to draw a ball
    const drawBall = (ball) => {
      ctx.save()

      // If ball is breaking, draw break effect
      if (ball.breaking) {
        // Draw breaking effect (expanding circle)
        ctx.beginPath()
        ctx.arc(ball.x, ball.y, ball.radius * (1 + ball.breakFrame / 5), 0, Math.PI * 2)
        ctx.fillStyle = `${ball.color}44` // Semi-transparent
        ctx.fill()

        // Draw particles
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2
          const distance = ball.radius * (ball.breakFrame / 3)
          const particleX = ball.x + Math.cos(angle) * distance
          const particleY = ball.y + Math.sin(angle) * distance

          ctx.beginPath()
          ctx.arc(particleX, particleY, ball.radius / 4, 0, Math.PI * 2)
          ctx.fillStyle = ball.color
          ctx.fill()
        }
      }

      // Draw the ball itself
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)

      // Create gradient for ball
      const gradient = ctx.createRadialGradient(
        ball.x - ball.radius / 3,
        ball.y - ball.radius / 3,
        0,
        ball.x,
        ball.y,
        ball.radius,
      )
      gradient.addColorStop(0, "#ffffff")
      gradient.addColorStop(1, ball.color)

      ctx.fillStyle = gradient
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
      ctx.shadowBlur = 5
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      ctx.fill()

      ctx.restore()
    }

    // Function to draw the circular boundary
    const drawBoundary = () => {
      ctx.save()

      // Draw outer circle
      ctx.beginPath()
      ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2)
      ctx.strokeStyle = "#64748b"
      ctx.lineWidth = 3
      ctx.stroke()

      // Draw dashed inner circle
      ctx.beginPath()
      ctx.arc(centerX, centerY, circleRadius - 10, 0, Math.PI * 2)
      ctx.setLineDash([5, 5])
      ctx.strokeStyle = "#64748b88"
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.restore()
    }

    // Function to draw traces
    const drawTraces = () => {
      if (!showTraces || tracesRef.current.length < 2) return

      ctx.save()
      ctx.globalAlpha = 0.2

      for (let i = 0; i < tracesRef.current.length; i++) {
        const trace = tracesRef.current[i]

        ctx.beginPath()
        ctx.arc(trace.x, trace.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = trace.color
        ctx.fill()
      }

      ctx.restore()
    }

    // Function to break a ball into two new balls
    const breakBall = (ball) => {
      // Mark the ball as breaking
      ball.breaking = true
      ball.breakFrame = 0

      // Only create new balls if we haven't reached the limit
      if (ballsRef.current.length < maxBalls) {
        // Calculate new velocities (perpendicular to impact)
        const dx = ball.x - centerX
        const dy = ball.y - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Normalize direction vector
        const nx = dx / distance
        const ny = dy / distance

        // Calculate perpendicular vectors
        const px1 = -ny
        const py1 = nx
        const px2 = ny
        const py2 = -nx

        // Calculate speed (slightly reduced)
        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy) * 0.9

        // Create two new balls
        const newBall1 = {
          x: ball.x,
          y: ball.y,
          vx: px1 * speed,
          vy: py1 * speed,
          radius: ball.radius * 0.8, // Smaller
          color: getRandomColor(),
          breaking: false,
          breakFrame: 0,
        }

        const newBall2 = {
          x: ball.x,
          y: ball.y,
          vx: px2 * speed,
          vy: py2 * speed,
          radius: ball.radius * 0.8, // Smaller
          color: getRandomColor(),
          breaking: false,
          breakFrame: 0,
        }

        // Add new balls to the array
        ballsRef.current.push(newBall1, newBall2)
      }
    }

    // Animation function
    const animate = (timestamp) => {
      if (!isAnimating) return

      // Calculate time delta
      const deltaTime = timestamp - (lastTimeRef.current || timestamp)
      lastTimeRef.current = timestamp

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw traces
      drawTraces()

      // Draw boundary
      drawBoundary()

      // Update and draw balls
      const newBalls = []

      for (let i = 0; i < ballsRef.current.length; i++) {
        const ball = ballsRef.current[i]

        // If ball is breaking, update break animation
        if (ball.breaking) {
          ball.breakFrame++

          // Remove ball after break animation completes
          if (ball.breakFrame > 10) {
            continue
          }
        } else {
          // Update position
          ball.x += (ball.vx * deltaTime) / 1000
          ball.y += (ball.vy * deltaTime) / 1000

          // Apply gravity if enabled
          if (gravity) {
            ball.vy += (200 * deltaTime) / 1000 // 200 px/s²
          }

          // Check for collision with boundary
          const dx = ball.x - centerX
          const dy = ball.y - centerY
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance + ball.radius > circleRadius) {
            // Ball hit the boundary
            if (!ball.breaking) {
              breakBall(ball)
            }
          }

          // Add trace point
          if (showTraces && Math.random() < 0.2) {
            tracesRef.current.push({
              x: ball.x,
              y: ball.y,
              color: ball.color,
            })

            // Limit trace points
            if (tracesRef.current.length > 500) {
              tracesRef.current.shift()
            }
          }
        }

        // Draw the ball
        drawBall(ball)

        // Keep ball for next frame
        newBalls.push(ball)
      }

      // Update balls array
      ballsRef.current = newBalls

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
  }, [isAnimating, gravity, showTraces, maxBalls])

  return (
    <motion.div
      className="w-full max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <motion.h2
          className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Bouncing Ball Break Simulator
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center space-x-4">
            <img src="/SimL.png" alt="Physics Lab Logo" className="h-10 w-auto hidden dark:hidden" />
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
              min={0}
              max={300}
              step={5}
              onChange={setInitialSpeed}
              unit=" px/s"
            />

            <SliderRow label="Ball Size" value={ballSize} min={5} max={30} step={1} onChange={setBallSize} unit=" px" />

            <SliderRow label="Max Balls" value={maxBalls} min={5} max={50} step={1} onChange={setMaxBalls} />

            <div className="flex flex-col space-y-2 mt-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="gravity-toggle"
                  checked={gravity}
                  onChange={() => setGravity(!gravity)}
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="gravity-toggle" className="text-sm font-medium">
                  Enable Gravity
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="traces-toggle"
                  checked={showTraces}
                  onChange={() => setShowTraces(!showTraces)}
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="traces-toggle" className="text-sm font-medium">
                  Show Traces
                </label>
              </div>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={startSimulation}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-400 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
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

          {/* Ball count display */}
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Simulation Stats</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Current Balls:</div>
              <div className="font-mono">
                {ballsRef.current.length} / {maxBalls}
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
                  <span className="font-medium">Ball Breaking:</span> When a ball hits the circular boundary, it breaks
                  into two smaller balls
                </li>
                <li>
                  <span className="font-medium">Conservation of Energy:</span> New balls have slightly less energy
                  (smaller and slower)
                </li>
                <li>
                  <span className="font-medium">Direction:</span> New balls travel perpendicular to the impact point
                </li>
                <li>
                  <span className="font-medium">Gravity:</span> Optional downward acceleration that affects all balls
                </li>
                <li>
                  <span className="font-medium">Traces:</span> Show the path history of each ball's movement
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
