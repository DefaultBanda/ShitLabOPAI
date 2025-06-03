"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import SliderRow from "../ui/SliderRow"

export default function WallBreakEscape() {
  const canvasRef = useRef(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isStarted, setIsStarted] = useState(false)

  // Scaling factor (pixels per meter)
  const SCALE = 100

  // Polygon settings
  const [polygonRadius, setPolygonRadius] = useState(1.5) // meters
  const [polygonSides, setPolygonSides] = useState(6)
  const [polygonShrinkRate, setPolygonShrinkRate] = useState(0.99)
  const [polygonMinRadius, setPolygonMinRadius] = useState(0.75) // meters
  const [rotationSpeed, setRotationSpeed] = useState(0.02) // radians per frame

  // Ball settings
  const [ballRadius, setBallRadius] = useState(0.15) // meters
  const [ballVelocityX, setBallVelocityX] = useState(1.0) // m/s
  const [ballVelocityY, setBallVelocityY] = useState(-1.5) // m/s
  const [ballGravity, setBallGravity] = useState(0.3) // m/s²
  const [ballFriction, setBallFriction] = useState(1)
  const [ballElasticity, setBallElasticity] = useState(0.95)
  const [ballDrag, setBallDrag] = useState(0.99)
  const [terminalVelocity, setTerminalVelocity] = useState(5) // m/s

  // Other settings
  const [spawnTime, setSpawnTime] = useState(3.2) // seconds
  const [showHitMarker, setShowHitMarker] = useState(true)
  const [autoRespawn, setAutoRespawn] = useState(true)

  // Animation state
  const animationRef = useRef(null)
  const lastTimeRef = useRef(0)
  const stateRef = useRef({
    ball: {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 0,
    },
    walls: [],
    rotation: 0,
    escaped: false,
    escapeTime: 0,
    shapesCompleted: 0,
    hitMarkers: [],
  })

  // Reset function
  const resetSimulation = () => {
    setIsAnimating(false)
    setIsStarted(false)
    initializeShape()
  }

  // Start simulation
  const startSimulation = () => {
    if (!isStarted) {
      initializeShape()
      setIsStarted(true)
    }
    setIsAnimating(true)
  }

  // Pause simulation
  const pauseSimulation = () => {
    setIsAnimating(false)
  }

  // Initialize shape and ball
  const initializeShape = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2

    // Create walls (convert meters to pixels)
    const walls = []
    const pixelRadius = polygonRadius * SCALE

    for (let i = 0; i < polygonSides; i++) {
      const angle1 = (i / polygonSides) * Math.PI * 2
      const angle2 = ((i + 1) / polygonSides) * Math.PI * 2

      const x1 = centerX + pixelRadius * Math.cos(angle1)
      const y1 = centerY + pixelRadius * Math.sin(angle1)
      const x2 = centerX + pixelRadius * Math.cos(angle2)
      const y2 = centerY + pixelRadius * Math.sin(angle2)

      walls.push({
        x1,
        y1,
        x2,
        y2,
        broken: false,
        breakFrame: 0,
      })
    }

    // Initialize ball in center (convert meters to pixels)
    const ball = {
      x: centerX,
      y: centerY,
      vx: ballVelocityX,
      vy: ballVelocityY,
      radius: ballRadius * SCALE,
    }

    stateRef.current = {
      ball,
      walls,
      rotation: 0,
      escaped: false,
      escapeTime: 0,
      shapesCompleted: stateRef.current.shapesCompleted || 0,
      hitMarkers: [],
    }
  }

  // Effect to initialize simulation
  useEffect(() => {
    initializeShape()
  }, [polygonRadius, polygonSides, ballRadius, ballVelocityX, ballVelocityY])

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2

    // Function to draw the ball
    const drawBall = (ball) => {
      ctx.save()
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
      gradient.addColorStop(1, "#3b82f6")

      ctx.fillStyle = gradient
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
      ctx.shadowBlur = 5
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      ctx.fill()
      ctx.restore()
    }

    // Function to draw walls
    const drawWalls = (walls, rotation) => {
      ctx.save()

      // Apply rotation
      ctx.translate(centerX, centerY)
      ctx.rotate(rotation)
      ctx.translate(-centerX, -centerY)

      walls.forEach((wall) => {
        if (wall.broken) {
          // Draw breaking effect
          if (wall.breakFrame < 10) {
            const progress = wall.breakFrame / 10
            ctx.beginPath()
            ctx.moveTo(wall.x1, wall.y1)
            ctx.lineTo(wall.x2, wall.y2)
            ctx.strokeStyle = `rgba(249, 115, 22, ${1 - progress})`
            ctx.lineWidth = 3 + progress * 5
            ctx.stroke()

            // Draw particles
            const numParticles = 5
            for (let i = 0; i < numParticles; i++) {
              const t = i / numParticles
              const x = wall.x1 + (wall.x2 - wall.x1) * t
              const y = wall.y1 + (wall.y2 - wall.y1) * t
              const size = 3 * (1 - progress)

              ctx.beginPath()
              ctx.arc(
                x + (Math.random() - 0.5) * 20 * progress,
                y + (Math.random() - 0.5) * 20 * progress,
                size,
                0,
                Math.PI * 2,
              )
              ctx.fillStyle = "#f97316"
              ctx.fill()
            }
          }
        } else {
          // Draw normal wall
          ctx.beginPath()
          ctx.moveTo(wall.x1, wall.y1)
          ctx.lineTo(wall.x2, wall.y2)
          ctx.strokeStyle = "#64748b"
          ctx.lineWidth = 3
          ctx.stroke()
        }
      })

      ctx.restore()
    }

    // Function to draw hit markers
    const drawHitMarkers = (hitMarkers) => {
      if (!showHitMarker) return

      ctx.save()

      hitMarkers.forEach((marker) => {
        const progress = marker.frame / 20
        if (progress < 1) {
          ctx.beginPath()
          ctx.arc(marker.x, marker.y, 10 * (1 - progress), 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(239, 68, 68, ${1 - progress})`
          ctx.lineWidth = 2
          ctx.stroke()

          marker.frame++
        }
      })

      // Remove old markers
      stateRef.current.hitMarkers = hitMarkers.filter((marker) => marker.frame < 20)

      ctx.restore()
    }

    // Function to check collision with walls
    const checkWallCollision = (ball, walls, rotation) => {
      let collided = false
      let allBroken = true

      // Create a rotated ball position for collision detection
      const rotatedBallX = centerX + (ball.x - centerX) * Math.cos(-rotation) - (ball.y - centerY) * Math.sin(-rotation)
      const rotatedBallY = centerY + (ball.x - centerX) * Math.sin(-rotation) + (ball.y - centerY) * Math.cos(-rotation)

      walls.forEach((wall) => {
        if (wall.broken) {
          if (wall.breakFrame < 10) {
            wall.breakFrame++
          }
          return
        }

        allBroken = false

        // Line segment collision detection
        const x1 = wall.x1
        const y1 = wall.y1
        const x2 = wall.x2
        const y2 = wall.y2

        // Vector from line start to ball
        const vx1 = rotatedBallX - x1
        const vy1 = rotatedBallY - y1

        // Vector along the line
        const vx2 = x2 - x1
        const vy2 = y2 - y1

        // Length of line
        const lineLength = Math.sqrt(vx2 * vx2 + vy2 * vy2)

        // Normalize line vector
        const nx = vx2 / lineLength
        const ny = vy2 / lineLength

        // Project ball position onto line
        const projection = vx1 * nx + vy1 * ny
        const projectionX = x1 + nx * projection
        const projectionY = y1 + ny * projection

        // Check if projection is on line segment
        const onSegment = projection >= 0 && projection <= lineLength

        // Distance from ball to projection
        const distX = rotatedBallX - projectionX
        const distY = rotatedBallY - projectionY
        const distance = Math.sqrt(distX * distX + distY * distY)

        if (onSegment && distance <= ball.radius) {
          // Collision detected
          collided = true
          wall.broken = true
          wall.breakFrame = 0

          // Add hit marker
          if (showHitMarker) {
            // Convert back to non-rotated coordinates for hit marker
            const hitX =
              centerX + (projectionX - centerX) * Math.cos(rotation) - (projectionY - centerY) * Math.sin(rotation)
            const hitY =
              centerY + (projectionX - centerX) * Math.sin(rotation) + (projectionY - centerY) * Math.cos(rotation)

            stateRef.current.hitMarkers.push({
              x: hitX,
              y: hitY,
              frame: 0,
            })
          }

          // Reflect velocity (in rotated space)
          // Calculate rotated velocity
          const rotatedVx = ball.vx * Math.cos(-rotation) - ball.vy * Math.sin(-rotation)
          const rotatedVy = ball.vx * Math.sin(-rotation) + ball.vy * Math.cos(-rotation)

          // Reflect
          const dot = rotatedVx * distX + rotatedVy * distY
          const factor = (2 * dot) / (distance * distance)
          const reflectedVx = rotatedVx - factor * distX * ballElasticity
          const reflectedVy = rotatedVy - factor * distY * ballElasticity

          // Convert back to non-rotated space
          ball.vx = reflectedVx * Math.cos(rotation) - reflectedVy * Math.sin(rotation)
          ball.vy = reflectedVx * Math.sin(rotation) + reflectedVy * Math.cos(rotation)

          // Apply friction
          ball.vx *= ballFriction
          ball.vy *= ballFriction

          // Move ball outside wall
          const overlap = ball.radius - distance
          const rotatedOverlapX = (overlap * distX) / distance
          const rotatedOverlapY = (overlap * distY) / distance

          // Convert overlap to non-rotated space
          const overlapX = rotatedOverlapX * Math.cos(rotation) - rotatedOverlapY * Math.sin(rotation)
          const overlapY = rotatedOverlapX * Math.sin(rotation) + rotatedOverlapY * Math.cos(rotation)

          ball.x += overlapX
          ball.y += overlapY
        }
      })

      return { collided, allBroken }
    }

    // Function to check if ball is outside the canvas
    const isOutsideBounds = (ball, width, height) => {
      return (
        ball.x < -ball.radius || ball.x > width + ball.radius || ball.y < -ball.radius || ball.y > height + ball.radius
      )
    }

    // Function to draw physics info
    const drawPhysicsInfo = () => {
      const ball = stateRef.current.ball
      // Convert pixel velocities back to m/s for display
      const vx = ball.vx / SCALE
      const vy = ball.vy / SCALE
      const speed = Math.sqrt(vx * vx + vy * vy)
      const kineticEnergy = 0.5 * speed * speed

      ctx.save()
      ctx.fillStyle = "#64748b"
      ctx.font = "14px Arial"
      ctx.textAlign = "left"

      ctx.fillText(`Speed: ${speed.toFixed(2)} m/s`, 20, 30)
      ctx.fillText(`Kinetic Energy: ${kineticEnergy.toFixed(2)} J`, 20, 50)
      ctx.fillText(`Shapes Completed: ${stateRef.current.shapesCompleted}`, 20, 70)

      ctx.restore()
    }

    // Animation function
    const animate = (timestamp) => {
      if (!isAnimating) return

      // Calculate time delta in seconds
      const deltaTime = (timestamp - (lastTimeRef.current || timestamp)) / 1000
      lastTimeRef.current = timestamp

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      const state = stateRef.current
      const { ball, walls, rotation, escaped } = state

      // Update rotation
      state.rotation += rotationSpeed

      // Draw walls
      drawWalls(walls, rotation)

      // Draw hit markers
      drawHitMarkers(state.hitMarkers)

      // Update ball position if not escaped
      if (!escaped) {
        // Apply gravity (convert m/s² to pixels/s²)
        ball.vy += ballGravity * SCALE * deltaTime

        // Apply drag
        ball.vx *= Math.pow(ballDrag, deltaTime * 60) // Adjust for frame rate independence
        ball.vy *= Math.pow(ballDrag, deltaTime * 60)

        // Apply terminal velocity (convert m/s to pixels/s)
        const pixelTerminalVelocity = terminalVelocity * SCALE
        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
        if (speed > pixelTerminalVelocity) {
          const factor = pixelTerminalVelocity / speed
          ball.vx *= factor
          ball.vy *= factor
        }

        // Update position (convert m/s to pixels/s)
        ball.x += ball.vx * deltaTime
        ball.y += ball.vy * deltaTime

        // Check wall collisions
        const { allBroken } = checkWallCollision(ball, walls, rotation)

        // Check if all walls are broken
        if (allBroken) {
          state.escaped = true
          state.escapeTime = 0
        }
      } else {
        // Ball has escaped, update escape time
        state.escapeTime += deltaTime // Already in seconds

        // Check if ball is outside bounds or spawn time reached
        if (isOutsideBounds(ball, width, height) || state.escapeTime >= spawnTime) {
          if (autoRespawn) {
            // Increment completed shapes counter
            state.shapesCompleted++

            // Create new shape with potentially shrunk radius
            const newRadius = Math.max(
              polygonMinRadius,
              polygonRadius * Math.pow(polygonShrinkRate, state.shapesCompleted),
            )

            // Create walls (convert meters to pixels)
            const pixelRadius = newRadius * SCALE
            const newWalls = []
            for (let i = 0; i < polygonSides; i++) {
              const angle1 = (i / polygonSides) * Math.PI * 2
              const angle2 = ((i + 1) / polygonSides) * Math.PI * 2

              const x1 = centerX + pixelRadius * Math.cos(angle1)
              const y1 = centerY + pixelRadius * Math.sin(angle1)
              const x2 = centerX + pixelRadius * Math.cos(angle2)
              const y2 = centerY + pixelRadius * Math.sin(angle2)

              newWalls.push({
                x1,
                y1,
                x2,
                y2,
                broken: false,
                breakFrame: 0,
              })
            }

            // Reset ball
            ball.x = centerX
            ball.y = centerY
            ball.vx = ballVelocityX * SCALE
            ball.vy = ballVelocityY * SCALE

            // Update state
            state.walls = newWalls
            state.escaped = false
            state.hitMarkers = []
          } else {
            // Stop animation if auto respawn is disabled
            setIsAnimating(false)
            setIsStarted(false)
          }
        }
      }

      // Draw ball
      drawBall(ball)

      // Draw physics info
      drawPhysicsInfo()

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
  }, [
    isAnimating,
    autoRespawn,
    showHitMarker,
    ballRadius,
    ballElasticity,
    ballFriction,
    ballGravity,
    ballDrag,
    terminalVelocity,
    polygonRadius,
    polygonSides,
    polygonMinRadius,
    polygonShrinkRate,
    rotationSpeed,
    spawnTime,
    ballVelocityX,
    ballVelocityY,
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
          className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Wall Break Escape
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
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Polygon Settings</h3>

            <SliderRow
              label="Polygon Radius"
              value={polygonRadius}
              min={0.5}
              max={2.5}
              step={0.1}
              onChange={setPolygonRadius}
              unit=" m"
            />

            <SliderRow
              label="Polygon Sides"
              value={polygonSides}
              min={3}
              max={250}
              step={1}
              onChange={setPolygonSides}
            />

            <SliderRow
              label="Polygon Shrink Rate"
              value={polygonShrinkRate}
              min={0.8}
              max={1}
              step={0.01}
              onChange={setPolygonShrinkRate}
            />

            <SliderRow
              label="Polygon Min Radius"
              value={polygonMinRadius}
              min={0.1}
              max={1.5}
              step={0.05}
              onChange={setPolygonMinRadius}
              unit=" m"
            />

            <SliderRow
              label="Rotation Speed"
              value={rotationSpeed}
              min={0}
              max={0.1}
              step={0.001}
              onChange={setRotationSpeed}
              unit=" rad/frame"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Ball Settings</h3>

            <SliderRow
              label="Ball Radius"
              value={ballRadius}
              min={0.05}
              max={0.3}
              step={0.01}
              onChange={setBallRadius}
              unit=" m"
            />

            <SliderRow
              label="Ball Velocity X"
              value={ballVelocityX}
              min={-3}
              max={3}
              step={0.1}
              onChange={setBallVelocityX}
              unit=" m/s"
            />

            <SliderRow
              label="Ball Velocity Y"
              value={ballVelocityY}
              min={-3}
              max={3}
              step={0.1}
              onChange={setBallVelocityY}
              unit=" m/s"
            />

            <SliderRow
              label="Ball Gravity"
              value={ballGravity}
              min={0}
              max={1}
              step={0.01}
              onChange={setBallGravity}
              unit=" m/s²"
            />

            <SliderRow
              label="Ball Friction"
              value={ballFriction}
              min={0.5}
              max={1}
              step={0.01}
              onChange={setBallFriction}
            />

            <SliderRow
              label="Ball Elasticity"
              value={ballElasticity}
              min={0.1}
              max={1}
              step={0.01}
              onChange={setBallElasticity}
            />

            <SliderRow label="Ball Drag" value={ballDrag} min={0.9} max={1} step={0.001} onChange={setBallDrag} />

            <SliderRow
              label="Terminal Velocity"
              value={terminalVelocity}
              min={1}
              max={10}
              step={0.1}
              onChange={setTerminalVelocity}
              unit=" m/s"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Other Settings</h3>

            <SliderRow
              label="Spawn Time"
              value={spawnTime}
              min={0.5}
              max={10}
              step={0.1}
              onChange={setSpawnTime}
              unit=" sec"
            />

            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="show-hit-marker"
                checked={showHitMarker}
                onChange={() => setShowHitMarker(!showHitMarker)}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="show-hit-marker" className="text-sm font-medium">
                Show Hit Marker
              </label>
            </div>

            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="auto-respawn"
                checked={autoRespawn}
                onChange={() => setAutoRespawn(!autoRespawn)}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="auto-respawn" className="text-sm font-medium">
                Auto Respawn
              </label>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={startSimulation}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-400 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
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

          {/* Shape information */}
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Shape Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Current Shape:</div>
              <div className="font-mono">
                {polygonSides === 3
                  ? "Triangle"
                  : polygonSides === 4
                    ? "Square"
                    : polygonSides === 5
                      ? "Pentagon"
                      : polygonSides === 6
                        ? "Hexagon"
                        : polygonSides === 8
                          ? "Octagon"
                          : polygonSides > 100
                            ? "Circle"
                            : `${polygonSides}-gon`}
              </div>
              <div>Shapes Completed:</div>
              <div className="font-mono">{stateRef.current.shapesCompleted}</div>
              <div>Current Radius:</div>
              <div className="font-mono">
                {Math.max(
                  polygonMinRadius,
                  polygonRadius * Math.pow(polygonShrinkRate, stateRef.current.shapesCompleted),
                ).toFixed(2)}{" "}
                m
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
                  <span className="font-medium">Elastic Collisions:</span> When the ball hits a wall, it bounces with
                  elasticity determining how much energy is conserved
                </li>
                <li>
                  <span className="font-medium">Gravity:</span> Constant downward acceleration (m/s²) affecting the
                  ball's vertical velocity
                </li>
                <li>
                  <span className="font-medium">Friction:</span> Reduces the ball's velocity upon collision with walls
                </li>
                <li>
                  <span className="font-medium">Drag:</span> Air resistance that gradually slows the ball's movement
                </li>
                <li>
                  <span className="font-medium">Terminal Velocity:</span> Maximum speed (m/s) the ball can reach due to
                  balancing forces
                </li>
                <li>
                  <span className="font-medium">Rotation:</span> The polygon rotates at a constant angular velocity,
                  creating dynamic collision scenarios
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
