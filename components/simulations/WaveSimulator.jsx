"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import SliderRow from "../ui/SliderRow"

export default function WaveSimulator() {
  // Basic wave parameters
  const [amplitude, setAmplitude] = useState(50)
  const [frequency, setFrequency] = useState(1)
  const [speed, setSpeed] = useState(1)
  const [waveType, setWaveType] = useState("sine") // sine, square, triangle, sawtooth, resonant

  // Advanced parameters
  const [advancedOn, setAdvancedOn] = useState(false)
  const [phaseShift, setPhaseShift] = useState(0)
  const [damping, setDamping] = useState(0)
  const [harmonics, setHarmonics] = useState(1)
  const [showGrid, setShowGrid] = useState(true)
  const [showPoints, setShowPoints] = useState(false)
  const [isAnimating, setIsAnimating] = useState(true)

  // Resonance parameters
  const [showResonance, setShowResonance] = useState(false)
  const [resonanceFrequency, setResonanceFrequency] = useState(2)
  const [resonanceAmplitude, setResonanceAmplitude] = useState(30)
  const [resonanceRatio, setResonanceRatio] = useState(1)
  const [showSecondWave, setShowSecondWave] = useState(false)
  const [secondWaveType, setSecondWaveType] = useState("sine")
  const [secondWaveFrequency, setSecondWaveFrequency] = useState(1.5)
  const [secondWaveAmplitude, setSecondWaveAmplitude] = useState(30)

  // Canvas refs
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const timeRef = useRef(0)

  // Effect for animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const width = canvas.width
    const height = canvas.height
    const centerY = height / 2

    // Function to draw the grid
    const drawGrid = () => {
      if (!showGrid) return

      ctx.save()
      ctx.strokeStyle = "#333333"
      ctx.lineWidth = 0.5
      ctx.globalAlpha = 0.2

      // Draw horizontal lines
      for (let y = 0; y <= height; y += 20) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Draw vertical lines
      for (let x = 0; x <= width; x += 20) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      // Draw center line (x-axis) with higher opacity
      ctx.globalAlpha = 0.5
      ctx.beginPath()
      ctx.moveTo(0, centerY)
      ctx.lineTo(width, centerY)
      ctx.stroke()

      ctx.restore()
    }

    // Function to calculate wave value based on type
    const calculateWaveValue = (x, time, waveParams) => {
      const { type, freq, amp, phase } = waveParams
      const phaseValue = x * freq + time * speed + phase
      let value = 0

      switch (type) {
        case "sine":
          value = Math.sin(phaseValue)
          break
        case "square":
          value = Math.sign(Math.sin(phaseValue))
          break
        case "triangle":
          value = 2 * Math.abs(((phaseValue / Math.PI) % 2) - 1) - 1
          break
        case "sawtooth":
          value = 2 * ((phaseValue / (2 * Math.PI)) % 1) - 1
          break
        case "resonant":
          // Resonant wave is a sine wave with amplitude that varies with time
          // Use the primary wave's frequency multiplied by the resonance ratio
          const baseFreq = freq / resonanceRatio
          const basePhase = x * baseFreq + time * speed + phase
          const modulationFactor = 1 + 0.5 * Math.sin(time * 0.2)
          value = Math.sin(basePhase) * modulationFactor
          break
        default:
          value = Math.sin(phaseValue)
      }

      // Add harmonics (only for sine wave)
      if (type === "sine" && harmonics > 1) {
        for (let i = 2; i <= harmonics; i++) {
          value += Math.sin(phaseValue * i) / i
        }
        // Normalize
        value = value / (1 + Math.log(harmonics))
      }

      // Apply damping
      if (damping > 0) {
        const dampingFactor = Math.exp((-damping * x) / 100)
        value *= dampingFactor
      }

      return value * amp
    }

    // Function to draw a wave
    const drawWave = (time, waveParams, color) => {
      ctx.save()

      // Create gradient for the wave
      const gradient = ctx.createLinearGradient(0, centerY - waveParams.amp, 0, centerY + waveParams.amp)

      if (color === "primary") {
        gradient.addColorStop(0, "#ff6b6b")
        gradient.addColorStop(0.5, "#f06595")
        gradient.addColorStop(1, "#cc5de8")
      } else if (color === "secondary") {
        gradient.addColorStop(0, "#4dabf7")
        gradient.addColorStop(0.5, "#3b82f6")
        gradient.addColorStop(1, "#4c6ef5")
      } else if (color === "resonant") {
        gradient.addColorStop(0, "#82c91e")
        gradient.addColorStop(0.5, "#40c057")
        gradient.addColorStop(1, "#12b886")
      }

      ctx.strokeStyle = gradient
      ctx.lineWidth = 2
      ctx.beginPath()

      const points = []
      const step = 2 // Step size for drawing points

      for (let x = 0; x < width; x += step) {
        const normalizedX = x / 50 // Scale down for better frequency control
        const y = centerY - calculateWaveValue(normalizedX, time, waveParams)

        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        points.push({ x, y })
      }

      ctx.stroke()

      // Draw points if enabled
      if (showPoints) {
        if (color === "primary") {
          ctx.fillStyle = "#f06595"
        } else if (color === "secondary") {
          ctx.fillStyle = "#3b82f6"
        } else if (color === "resonant") {
          ctx.fillStyle = "#40c057"
        }

        for (const point of points) {
          ctx.beginPath()
          ctx.arc(point.x, point.y, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.restore()

      return points
    }

    // Function to draw the combined wave
    const drawCombinedWave = (points1, points2) => {
      if (!points1 || !points2 || points1.length !== points2.length) return

      ctx.save()

      // Create gradient for the combined wave
      const maxAmp = amplitude + (showSecondWave ? secondWaveAmplitude : 0)
      const gradient = ctx.createLinearGradient(0, centerY - maxAmp, 0, centerY + maxAmp)
      gradient.addColorStop(0, "#9775fa")
      gradient.addColorStop(0.5, "#da77f2")
      gradient.addColorStop(1, "#f783ac")

      ctx.strokeStyle = gradient
      ctx.lineWidth = 2
      ctx.beginPath()

      for (let i = 0; i < points1.length; i++) {
        const x = points1[i].x
        const y1 = points1[i].y - centerY
        const y2 = points2[i].y - centerY
        const y = centerY + y1 + y2

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.stroke()

      // Draw points if enabled
      if (showPoints) {
        ctx.fillStyle = "#da77f2"
        for (let i = 0; i < points1.length; i++) {
          const x = points1[i].x
          const y1 = points1[i].y - centerY
          const y2 = points2[i].y - centerY
          const y = centerY + y1 + y2

          ctx.beginPath()
          ctx.arc(x, y, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.restore()
    }

    // Animation function
    const animate = () => {
      if (!isAnimating) return

      ctx.clearRect(0, 0, width, height)
      drawGrid()

      // Draw primary wave
      const primaryWaveParams = {
        type: waveType,
        freq: frequency,
        amp: amplitude,
        phase: phaseShift,
      }
      const primaryPoints = drawWave(timeRef.current, primaryWaveParams, "primary")

      // Draw resonant wave if enabled
      if (showResonance) {
        const resonantWaveParams = {
          type: "resonant",
          freq: frequency * resonanceRatio, // Use primary frequency * ratio
          amp: resonanceAmplitude,
          phase: phaseShift, // Use primary phase
        }
        drawWave(timeRef.current, resonantWaveParams, "resonant")
      }

      // Draw second wave if enabled (but not if resonant is enabled)
      if (showSecondWave && !showResonance) {
        const secondWaveParams = {
          type: secondWaveType,
          freq: secondWaveFrequency,
          amp: secondWaveAmplitude,
          phase: 0,
        }
        const secondaryPoints = drawWave(timeRef.current, secondWaveParams, "secondary")

        // Draw combined wave
        drawCombinedWave(primaryPoints, secondaryPoints)
      }

      timeRef.current += 0.05
      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [
    amplitude,
    frequency,
    speed,
    waveType,
    phaseShift,
    damping,
    harmonics,
    showGrid,
    showPoints,
    isAnimating,
    showResonance,
    resonanceFrequency,
    resonanceAmplitude,
    resonanceRatio,
    showSecondWave,
    secondWaveType,
    secondWaveFrequency,
    secondWaveAmplitude,
  ])

  // Toggle animation
  const toggleAnimation = () => {
    setIsAnimating(!isAnimating)
  }

  // Reset animation
  const resetAnimation = () => {
    timeRef.current = 0
    if (!isAnimating) {
      setIsAnimating(true)
    }
  }

  // Handle wave type change
  const handleWaveTypeChange = (type) => {
    setWaveType(type)
    if (type === "resonant") {
      setShowResonance(true)
      setShowSecondWave(false) // Disable second wave when resonant is selected
    } else if (showResonance && waveType === "resonant") {
      setShowResonance(false)
    }
  }

  // Handle second wave toggle
  const handleSecondWaveToggle = () => {
    const newValue = !showSecondWave
    setShowSecondWave(newValue)

    // If enabling second wave, disable resonance
    if (newValue && showResonance) {
      setShowResonance(false)
      if (waveType === "resonant") {
        setWaveType("sine")
      }
    }
  }

  return (
    <motion.div
      className="w-full max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <motion.h2
          className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Wave Simulator
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex space-x-4"
        >
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={advancedOn}
              onChange={() => setAdvancedOn(!advancedOn)}
              className="sr-only peer"
              aria-label="Enable Advanced Options"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
            <span className="ml-3 text-sm font-medium">Advanced</span>
          </label>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showSecondWave}
              onChange={handleSecondWaveToggle}
              className="sr-only peer"
              aria-label="Add Second Wave"
              disabled={showResonance || waveType === "resonant"}
            />
            <div
              className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${showResonance || waveType === "resonant" ? "opacity-50" : ""}`}
            ></div>
            <span className="ml-3 text-sm font-medium">Add Wave</span>
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

            <SliderRow
              label="Amplitude"
              value={amplitude}
              min={10}
              max={100}
              step={1}
              onChange={setAmplitude}
              unit=" px"
            />
            <SliderRow
              label="Frequency"
              value={frequency}
              min={0.1}
              max={5}
              step={0.1}
              onChange={setFrequency}
              unit=" Hz"
            />
            <SliderRow label="Speed" value={speed} min={0.1} max={5} step={0.1} onChange={setSpeed} unit="x" />

            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">Wave Type</label>
              <div className="grid grid-cols-2 gap-2">
                {["sine", "square", "triangle", "sawtooth", "resonant"].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleWaveTypeChange(type)}
                    className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      waveType === type
                        ? "bg-pink-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Second wave parameters */}
          <AnimatePresence>
            {showSecondWave && !showResonance && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Second Wave</h3>

                <SliderRow
                  label="Amplitude"
                  value={secondWaveAmplitude}
                  min={10}
                  max={100}
                  step={1}
                  onChange={setSecondWaveAmplitude}
                  unit=" px"
                />
                <SliderRow
                  label="Frequency"
                  value={secondWaveFrequency}
                  min={0.1}
                  max={5}
                  step={0.1}
                  onChange={setSecondWaveFrequency}
                  unit=" Hz"
                />

                <div className="mt-4">
                  <label className="text-sm font-medium mb-2 block">Wave Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["sine", "square", "triangle", "sawtooth"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setSecondWaveType(type)}
                        className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                          secondWaveType === type
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resonance parameters */}
          <AnimatePresence>
            {(showResonance || waveType === "resonant") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Resonance Parameters</h3>

                <SliderRow
                  label="Resonance Amplitude"
                  value={resonanceAmplitude}
                  min={10}
                  max={100}
                  step={1}
                  onChange={setResonanceAmplitude}
                  unit=" px"
                />

                <SliderRow
                  label="Resonance Ratio"
                  value={resonanceRatio}
                  min={0.5}
                  max={4}
                  step={0.1}
                  onChange={setResonanceRatio}
                  unit="x"
                />

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Resonant frequency: {(frequency * resonanceRatio).toFixed(2)} Hz
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Advanced sliders (collapsible) */}
          <AnimatePresence>
            {advancedOn && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Advanced Parameters</h3>

                <SliderRow
                  label="Phase Shift"
                  value={phaseShift}
                  min={0}
                  max={Math.PI * 2}
                  step={0.1}
                  onChange={setPhaseShift}
                  unit=" rad"
                />
                <SliderRow label="Damping" value={damping} min={0} max={5} step={0.1} onChange={setDamping} />
                <SliderRow
                  label="Harmonics"
                  value={harmonics}
                  min={1}
                  max={10}
                  step={1}
                  onChange={setHarmonics}
                  unit={harmonics === 1 ? " harmonic" : " harmonics"}
                />

                <div className="flex flex-col space-y-2 mt-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="grid-toggle"
                      checked={showGrid}
                      onChange={() => setShowGrid(!showGrid)}
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <label htmlFor="grid-toggle" className="text-sm font-medium">
                      Show Grid
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="points-toggle"
                      checked={showPoints}
                      onChange={() => setShowPoints(!showPoints)}
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <label htmlFor="points-toggle" className="text-sm font-medium">
                      Show Points
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Control buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={toggleAnimation}
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {isAnimating ? "Pause" : "Resume"}
            </motion.button>

            <motion.button
              onClick={resetAnimation}
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

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              <h3 className="font-semibold mb-2">Wave Physics Explained:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <span className="font-medium">Sine Wave:</span> The most basic wave form, representing simple harmonic
                  motion
                </li>
                <li>
                  <span className="font-medium">Square Wave:</span> Alternates between two fixed values, used in digital
                  signals
                </li>
                <li>
                  <span className="font-medium">Triangle Wave:</span> Linear rise and fall, contains odd harmonics with
                  amplitudes falling as 1/n²
                </li>
                <li>
                  <span className="font-medium">Sawtooth Wave:</span> Rapid rise and linear fall, rich in harmonics,
                  used in synthesizers
                </li>
                <li>
                  <span className="font-medium">Resonant Wave:</span> A wave that responds to the primary wave's
                  frequency, demonstrating resonance effects
                </li>
                <li>
                  <span className="font-medium">Combined Waves:</span> When two waves overlap, they can create
                  constructive or destructive interference
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
