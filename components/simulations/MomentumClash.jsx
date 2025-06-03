"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import SliderRow from "../ui/SliderRow"

export default function MomentumClash() {
  const canvasRef = useRef(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [quizMode, setQuizMode] = useState(false)
  const [showVectors, setShowVectors] = useState(true)
  const [guessVelocityA, setGuessVelocityA] = useState(0)
  const [guessVelocityB, setGuessVelocityB] = useState(0)
  const [showResults, setShowResults] = useState(false)

  // Physics parameters (real-world units)
  const [massA, setMassA] = useState(2)
  const [velocityA, setVelocityA] = useState(5) // m/s
  const [massB, setMassB] = useState(4)
  const [velocityB, setVelocityB] = useState(-2) // m/s
  const [collisionType, setCollisionType] = useState("elastic") // elastic, inelastic, perfectlyInelastic

  // Scaling factor to convert between real-world units and pixels
  const SCALE = 30 // pixels per meter

  // Simulation state
  const stateRef = useRef({
    objectA: {
      x: 0,
      y: 0,
      vx: 0,
      width: 0,
      height: 0,
      color: "#3b82f6", // blue
    },
    objectB: {
      x: 0,
      y: 0,
      vx: 0,
      width: 0,
      height: 0,
      color: "#ef4444", // red
    },
    initialMomentum: 0,
    finalMomentum: 0,
    initialKE: 0,
    finalKE: 0,
    collided: false,
    time: 0,
  })

  // Animation refs
  const animationRef = useRef(null)
  const lastTimeRef = useRef(0)

  // Reset simulation
  const resetSimulation = () => {
    setIsAnimating(false)
    setIsStarted(false)
    setShowResults(false)
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

  // Submit quiz answers
  const submitQuizAnswers = () => {
    setShowResults(true)
    startSimulation()
  }

  // Initialize simulation
  const initializeSimulation = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const width = canvas.width
    const height = canvas.height
    const centerY = height / 2

    // Calculate object sizes based on mass (cube root scaling for 3D representation)
    const baseSize = 0.3 // base size in meters
    const objectAWidth = (baseSize + massA * 0.1) * SCALE // Convert to pixels
    const objectAHeight = (baseSize + massA * 0.1) * SCALE
    const objectBWidth = (baseSize + massB * 0.1) * SCALE
    const objectBHeight = (baseSize + massB * 0.1) * SCALE

    // Position objects (in pixels)
    let objectAX, objectBX

    if (velocityA >= 0 && velocityB <= 0) {
      // Objects moving toward each other
      objectAX = width * 0.25 - objectAWidth / 2
      objectBX = width * 0.75 - objectBWidth / 2
    } else if (velocityA <= 0 && velocityB >= 0) {
      // Objects moving away from each other
      objectAX = width * 0.4 - objectAWidth / 2
      objectBX = width * 0.6 - objectBWidth / 2
    } else if (velocityA > velocityB) {
      // A faster than B, both moving in same direction
      objectAX = width * 0.25 - objectAWidth / 2
      objectBX = width * 0.6 - objectBWidth / 2
    } else {
      // B faster than A, both moving in same direction
      objectAX = width * 0.4 - objectAWidth / 2
      objectBX = width * 0.75 - objectBWidth / 2
    }

    // Initialize state
    const state = {
      objectA: {
        x: objectAX,
        y: centerY - objectAHeight / 2,
        vx: velocityA * SCALE, // Convert m/s to pixels/s for internal calculations
        width: objectAWidth,
        height: objectAHeight,
        color: "#3b82f6", // blue
      },
      objectB: {
        x: objectBX,
        y: centerY - objectBHeight / 2,
        vx: velocityB * SCALE, // Convert m/s to pixels/s for internal calculations
        width: objectBWidth,
        height: objectBHeight,
        color: "#ef4444", // red
      },
      initialMomentum: massA * velocityA + massB * velocityB,
      finalMomentum: 0,
      initialKE: 0.5 * massA * velocityA * velocityA + 0.5 * massB * velocityB * velocityB,
      finalKE: 0,
      collided: false,
      time: 0,
    }

    stateRef.current = state
  }

  // Calculate collision results
  const calculateCollisionResults = () => {
    const { objectA, objectB } = stateRef.current
    const m1 = massA
    const m2 = massB
    const v1 = objectA.vx / SCALE // Convert back to m/s for physics calculations
    const v2 = objectB.vx / SCALE

    let v1Final, v2Final

    switch (collisionType) {
      case "elastic":
        // Elastic collision: kinetic energy is conserved
        v1Final = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2)
        v2Final = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2)
        break
      case "inelastic":
        // Inelastic collision: some kinetic energy is lost
        // Using coefficient of restitution e = 0.5
        const e = 0.5
        v1Final = (m1 * v1 + m2 * v2 + m2 * e * (v2 - v1)) / (m1 + m2)
        v2Final = (m1 * v1 + m2 * v2 + m1 * e * (v1 - v2)) / (m1 + m2)
        break
      case "perfectlyInelastic":
        // Perfectly inelastic collision: objects stick together
        const vFinal = (m1 * v1 + m2 * v2) / (m1 + m2)
        v1Final = vFinal
        v2Final = vFinal
        break
      default:
        v1Final = v1
        v2Final = v2
    }

    return {
      v1Final: v1Final * SCALE, // Convert back to pixels/s for animation
      v2Final: v2Final * SCALE,
      finalMomentum: m1 * v1Final + m2 * v2Final,
      finalKE: 0.5 * m1 * v1Final * v1Final + 0.5 * m2 * v2Final * v2Final,
    }
  }

  // Effect to initialize simulation when parameters change
  useEffect(() => {
    resetSimulation()
  }, [massA, velocityA, massB, velocityB, collisionType])

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const width = canvas.width
    const height = canvas.height

    // Function to draw an object
    const drawObject = (object, label) => {
      ctx.save()

      // Draw object
      ctx.fillStyle = object.color
      ctx.fillRect(object.x, object.y, object.width, object.height)

      // Draw label
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 16px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(label, object.x + object.width / 2, object.y + object.height / 2)

      ctx.restore()
    }

    // Function to draw velocity vector
    const drawVelocityVector = (object, velocity, label) => {
      if (!showVectors) return

      const centerX = object.x + object.width / 2
      const centerY = object.y + object.height / 2
      const vectorScale = 6 // Scale factor for vector visualization
      const realVelocity = velocity / SCALE // Convert to m/s for display
      const vectorLength = Math.abs(realVelocity) * vectorScale
      const direction = realVelocity >= 0 ? 1 : -1

      ctx.save()

      // Draw vector line
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX + vectorLength * direction, centerY)
      ctx.strokeStyle = object.color
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw arrowhead
      const arrowSize = 10
      if (vectorLength > 0) {
        ctx.beginPath()
        ctx.moveTo(centerX + vectorLength * direction, centerY)
        ctx.lineTo(centerX + vectorLength * direction - arrowSize * direction, centerY - arrowSize / 2)
        ctx.lineTo(centerX + vectorLength * direction - arrowSize * direction, centerY + arrowSize / 2)
        ctx.closePath()
        ctx.fillStyle = object.color
        ctx.fill()
      }

      // Draw label
      ctx.fillStyle = object.color
      ctx.font = "14px Arial"
      ctx.textAlign = "center"
      ctx.fillText(`${label}: ${realVelocity.toFixed(2)} m/s`, centerX, centerY - 20)

      ctx.restore()
    }

    // Function to draw momentum vector
    const drawMomentumVector = (object, mass, velocity, label) => {
      if (!showVectors) return

      const realVelocity = velocity / SCALE // Convert to m/s for physics
      const momentum = mass * realVelocity
      const centerX = object.x + object.width / 2
      const centerY = object.y + object.height + 30
      const vectorScale = 1.5 // Scale factor for momentum visualization
      const vectorLength = Math.abs(momentum) * vectorScale
      const direction = momentum >= 0 ? 1 : -1

      ctx.save()

      // Draw vector line
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX + vectorLength * direction, centerY)
      ctx.strokeStyle = "#8b5cf6" // purple
      ctx.lineWidth = 3
      ctx.stroke()

      // Draw arrowhead
      const arrowSize = 10
      if (vectorLength > 0) {
        ctx.beginPath()
        ctx.moveTo(centerX + vectorLength * direction, centerY)
        ctx.lineTo(centerX + vectorLength * direction - arrowSize * direction, centerY - arrowSize / 2)
        ctx.lineTo(centerX + vectorLength * direction - arrowSize * direction, centerY + arrowSize / 2)
        ctx.closePath()
        ctx.fillStyle = "#8b5cf6" // purple
        ctx.fill()
      }

      // Draw label
      ctx.fillStyle = "#8b5cf6" // purple
      ctx.font = "14px Arial"
      ctx.textAlign = "center"
      ctx.fillText(`${label}: ${momentum.toFixed(2)} kg·m/s`, centerX, centerY + 20)

      ctx.restore()
    }

    // Function to check collision
    const checkCollision = (objectA, objectB) => {
      return objectA.x + objectA.width >= objectB.x && objectA.x <= objectB.x + objectB.width
    }

    // Function to draw ground
    const drawGround = () => {
      ctx.save()
      ctx.fillStyle = "#d1d5db"
      ctx.fillRect(0, height - 20, width, 20)
      ctx.restore()
    }

    // Function to draw results panel
    const drawResultsPanel = () => {
      const state = stateRef.current
      const { initialMomentum, finalMomentum, initialKE, finalKE } = state
      const keLoss = ((initialKE - finalKE) / initialKE) * 100
      const momentumConserved = Math.abs(initialMomentum - finalMomentum) < 0.1

      ctx.save()

      // Draw panel background
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
      ctx.fillRect(width - 300, 20, 280, 180)
      ctx.strokeStyle = "#64748b"
      ctx.lineWidth = 2
      ctx.strokeRect(width - 300, 20, 280, 180)

      // Draw results
      ctx.fillStyle = "#1f2937"
      ctx.font = "16px Arial"
      ctx.textAlign = "left"
      ctx.fillText("Results:", width - 290, 45)

      ctx.font = "14px Arial"
      ctx.fillText(`Initial Momentum: ${initialMomentum.toFixed(2)} kg·m/s`, width - 290, 70)
      ctx.fillText(`Final Momentum: ${finalMomentum.toFixed(2)} kg·m/s`, width - 290, 95)
      ctx.fillText(`Initial Kinetic Energy: ${initialKE.toFixed(2)} J`, width - 290, 120)
      ctx.fillText(`Final Kinetic Energy: ${finalKE.toFixed(2)} J`, width - 290, 145)
      ctx.fillText(`KE Loss: ${keLoss.toFixed(1)}%`, width - 290, 170)

      // Draw momentum conservation indicator
      ctx.fillText("Momentum Conserved:", width - 290, 195)
      if (momentumConserved) {
        ctx.fillStyle = "#10b981" // green
        ctx.fillText("✓", width - 120, 195)
      } else {
        ctx.fillStyle = "#ef4444" // red
        ctx.fillText("✗", width - 120, 195)
      }

      ctx.restore()
    }

    // Animation function
    const animate = (timestamp) => {
      if (!isAnimating) return

      // Calculate time delta
      const deltaTime = timestamp - (lastTimeRef.current || timestamp)
      lastTimeRef.current = timestamp

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw ground
      drawGround()

      // Get current state
      const state = stateRef.current
      const { objectA, objectB, collided } = state

      // Update positions
      objectA.x += (objectA.vx * deltaTime) / 1000
      objectB.x += (objectB.vx * deltaTime) / 1000

      // Check for collision
      if (!collided && checkCollision(objectA, objectB)) {
        state.collided = true

        // Calculate post-collision velocities
        const { v1Final, v2Final, finalMomentum, finalKE } = calculateCollisionResults()
        objectA.vx = v1Final
        objectB.vx = v2Final
        state.finalMomentum = finalMomentum
        state.finalKE = finalKE

        // If perfectly inelastic, merge objects
        if (collisionType === "perfectlyInelastic") {
          // Calculate new position for merged objects
          const totalMass = massA + massB
          const centerOfMass = (objectA.x * massA + objectB.x * massB) / totalMass

          // Adjust object positions to simulate sticking together
          objectA.x = centerOfMass - objectA.width / 2
          objectB.x = objectA.x + objectA.width
        }
      }

      // Check if objects are out of bounds
      if (objectA.x + objectA.width < 0 || objectA.x > width || objectB.x + objectB.width < 0 || objectB.x > width) {
        // Reset or pause simulation
        if (state.collided) {
          pauseSimulation()
        }
      }

      // Draw objects
      drawObject(objectA, "A")
      drawObject(objectB, "B")

      // Draw velocity vectors
      drawVelocityVector(objectA, objectA.vx, "v")
      drawVelocityVector(objectB, objectB.vx, "v")

      // Draw momentum vectors
      drawMomentumVector(objectA, massA, objectA.vx, "p")
      drawMomentumVector(objectB, massB, objectB.vx, "p")

      // Draw results panel if collision occurred
      if (state.collided) {
        drawResultsPanel()
      }

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
  }, [isAnimating, massA, massB, collisionType, showVectors])

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
          Momentum Clash
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
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Object Parameters</h3>

            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="text-sm font-semibold mb-2 text-blue-600 dark:text-blue-400">Object A</h4>
              <SliderRow label="Mass (kg)" value={massA} min={1} max={10} step={0.1} onChange={setMassA} unit=" kg" />
              <SliderRow
                label="Velocity (m/s)"
                value={velocityA}
                min={-10}
                max={10}
                step={0.5}
                onChange={setVelocityA}
                unit=" m/s"
              />
            </div>

            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <h4 className="text-sm font-semibold mb-2 text-red-600 dark:text-red-400">Object B</h4>
              <SliderRow label="Mass (kg)" value={massB} min={1} max={10} step={0.1} onChange={setMassB} unit=" kg" />
              <SliderRow
                label="Velocity (m/s)"
                value={velocityB}
                min={-10}
                max={10}
                step={0.5}
                onChange={setVelocityB}
                unit=" m/s"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Collision Type</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setCollisionType("elastic")}
                  className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    collisionType === "elastic"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Elastic
                </button>
                <button
                  onClick={() => setCollisionType("inelastic")}
                  className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    collisionType === "inelastic"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Inelastic
                </button>
                <button
                  onClick={() => setCollisionType("perfectlyInelastic")}
                  className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    collisionType === "perfectlyInelastic"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Perfectly Inelastic
                </button>
              </div>
            </div>

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="show-vectors"
                checked={showVectors}
                onChange={() => setShowVectors(!showVectors)}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="show-vectors" className="text-sm font-medium">
                Show Momentum Vectors
              </label>
            </div>

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="quiz-mode"
                checked={quizMode}
                onChange={() => {
                  setQuizMode(!quizMode)
                  setShowResults(false)
                  resetSimulation()
                }}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="quiz-mode" className="text-sm font-medium">
                Quiz Mode
              </label>
            </div>

            {quizMode && !showResults && (
              <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h4 className="text-sm font-semibold mb-2 text-purple-600 dark:text-purple-400">
                  Predict Final Velocities
                </h4>
                <div className="mb-2">
                  <label className="text-sm font-medium">Object A Final Velocity (m/s)</label>
                  <input
                    type="number"
                    value={guessVelocityA}
                    onChange={(e) => setGuessVelocityA(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="mb-2">
                  <label className="text-sm font-medium">Object B Final Velocity (m/s)</label>
                  <input
                    type="number"
                    value={guessVelocityB}
                    onChange={(e) => setGuessVelocityB(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <button
                  onClick={submitQuizAnswers}
                  className="w-full mt-2 bg-purple-500 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:bg-purple-600 transition-colors"
                >
                  Submit Prediction
                </button>
              </div>
            )}
          </div>

          {/* Control buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={startSimulation}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-400 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={isAnimating || (quizMode && !showResults)}
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

          {/* Collision type explanation */}
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Collision Types</h4>
            <div className="text-sm space-y-2">
              <p>
                <span className="font-semibold">Elastic:</span> Kinetic energy is conserved. Objects bounce off each
                other.
              </p>
              <p>
                <span className="font-semibold">Inelastic:</span> Some kinetic energy is lost. Objects partially bounce.
              </p>
              <p>
                <span className="font-semibold">Perfectly Inelastic:</span> Maximum kinetic energy is lost. Objects
                stick together.
              </p>
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
                  <span className="font-medium">Conservation of Momentum:</span> In all collisions, the total momentum
                  (p = mv) before equals the total momentum after
                </li>
                <li>
                  <span className="font-medium">Kinetic Energy:</span> KE = ½mv². In elastic collisions, KE is
                  conserved. In inelastic collisions, some KE is converted to other forms (heat, sound)
                </li>
                <li>
                  <span className="font-medium">Elastic Collisions:</span> Objects bounce off each other with no energy
                  loss. Final velocities depend on the mass ratio
                </li>
                <li>
                  <span className="font-medium">Inelastic Collisions:</span> Some energy is lost during collision, but
                  objects still separate after impact
                </li>
                <li>
                  <span className="font-medium">Perfectly Inelastic Collisions:</span> Maximum energy loss occurs as
                  objects stick together and move with a common final velocity
                </li>
                <li>
                  <span className="font-medium">Coefficient of Restitution:</span> Measures the "bounciness" of a
                  collision, ranging from 0 (perfectly inelastic) to 1 (perfectly elastic)
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
