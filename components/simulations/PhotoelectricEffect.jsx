"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

const MATERIALS = {
  cesium: { workFunction: 2.1, color: "#FFD700", name: "Cesium" },
  potassium: { workFunction: 2.3, color: "#9370DB", name: "Potassium" },
  sodium: { workFunction: 2.75, color: "#FFA500", name: "Sodium" },
  zinc: { workFunction: 4.33, color: "#C0C0C0", name: "Zinc" },
  copper: { workFunction: 4.65, color: "#B87333", name: "Copper" },
  platinum: { workFunction: 6.35, color: "#E5E4E2", name: "Platinum" },
}

const TARGETS = {
  Sodium: 2.28,
  Zinc: 4.3,
  Copper: 4.7,
  Platinum: 6.35,
  Calcium: 2.9,
  Unknown: 5,
}

function wavelengthToColor(wl) {
  if (wl < 380) return "#8b00ff" // UV
  if (wl > 700) return "#800000" // IR
  let r = 0,
    g = 0,
    b = 0
  if (wl < 440) {
    r = -(wl - 440) / (440 - 380)
    b = 1
  } else if (wl < 490) {
    g = (wl - 440) / (490 - 440)
    b = 1
  } else if (wl < 510) {
    g = 1
    b = -(wl - 510) / (510 - 490)
  } else if (wl < 580) {
    r = (wl - 510) / (580 - 510)
    g = 1
  } else if (wl < 645) {
    r = 1
    g = -(wl - 645) / (645 - 580)
  } else {
    r = 1
  }
  const gamma = 0.8
  const toHex = (v) =>
    Math.round(255 * Math.pow(v, gamma))
      .toString(16)
      .padStart(2, "0")
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export default function PhotoelectricEffect() {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)

  const [selectedMaterial, setSelectedMaterial] = useState("cesium")
  const [frequency, setFrequency] = useState([5.0]) // in 10^14 Hz
  const [intensity, setIntensity] = useState([50])
  const [isRunning, setIsRunning] = useState(false)
  const [photons, setPhotons] = useState([])
  const [electrons, setElectrons] = useState([])
  const [current, setCurrent] = useState(0)
  const [stoppingVoltage, setStoppingVoltage] = useState(0)

  const material = MATERIALS[selectedMaterial]
  const photonEnergy = frequency[0] * 4.136 // Convert to eV (h = 4.136 × 10^-15 eV⋅s)
  const thresholdFreency = material.workFunction / 4.136
  const maxKineticEnergy = Math.max(0, photonEnergy - material.workFunction)
  const canEmitElectrons = photonEnergy > material.workFunction

  const electronsRef = useRef([])
  const photonsRef = useRef([])

  const [wavelength, setWavelength] = useState(400)
  const [voltage, setVoltage] = useState(0)
  const [target, setTarget] = useState("Sodium")
  const [showHighest, setShowHighest] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showPhotons, setShowPhotons] = useState(false)

  const [voltageData, setVoltageData] = useState([])
  const [intensityData, setIntensityData] = useState([])
  const [energyData, setEnergyData] = useState([])

  const [showVoltageGraph, setShowVoltageGraph] = useState(true)
  const [showIntensityGraph, setShowIntensityGraph] = useState(true)
  const [showEnergyGraph, setShowEnergyGraph] = useState(true)

  useEffect(() => {
    const c = 3e8
    const h = 4.135e-15 // eV*s
    const freq = c / (wavelength * 1e-9)
    const energy = Math.max(h * freq - TARGETS[target], 0)
    const current = energy > 0 ? (intensity / 100) * Math.max(energy - Math.max(voltage, 0), 0) : 0
    setVoltageData((d) => [...d, { voltage, current }].slice(-20))
    setIntensityData((d) => [...d, { intensity, current }].slice(-20))
    setEnergyData((d) => [...d, { frequency: freq / 1e15, energy }].slice(-20))
  }, [wavelength, intensity, voltage, target])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    canvas.width = 800
    canvas.height = 400

    const animate = () => {
      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "#0f0f23")
      gradient.addColorStop(1, "#1a1a2e")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw metal surface with realistic appearance
      const metalGradient = ctx.createLinearGradient(0, 0, 0, 100)
      metalGradient.addColorStop(0, material.color)
      metalGradient.addColorStop(0.3, "#ffffff40")
      metalGradient.addColorStop(0.7, material.color)
      metalGradient.addColorStop(1, "#00000040")

      ctx.fillStyle = metalGradient
      ctx.fillRect(50, 100, 150, 200)

      // Add metallic shine effect
      ctx.fillStyle = "#ffffff20"
      ctx.fillRect(60, 110, 20, 180)

      // Draw material label with glow effect
      ctx.shadowColor = material.color
      ctx.shadowBlur = 10
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 16px Arial"
      ctx.fillText(material.name, 80, 90)
      ctx.shadowBlur = 0

      // Draw photons with enhanced visuals
      photons.forEach((photon, index) => {
        // Photon glow effect
        const glowGradient = ctx.createRadialGradient(photon.x, photon.y, 0, photon.x, photon.y, 15)
        const wavelength = 300 / frequency[0] // Approximate wavelength for color
        const hue = Math.max(0, Math.min(360, 240 + wavelength * 2))
        glowGradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.8)`)
        glowGradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`)

        ctx.fillStyle = glowGradient
        ctx.beginPath()
        ctx.arc(photon.x, photon.y, 15, 0, Math.PI * 2)
        ctx.fill()

        // Photon core
        ctx.fillStyle = `hsl(${hue}, 100%, 80%)`
        ctx.beginPath()
        ctx.arc(photon.x, photon.y, 6, 0, Math.PI * 2)
        ctx.fill()

        // Energy-based size variation
        const energySize = Math.max(3, photonEnergy * 0.8)
        ctx.fillStyle = "#ffffff"
        ctx.beginPath()
        ctx.arc(photon.x, photon.y, energySize, 0, Math.PI * 2)
        ctx.fill()

        // Update photon position
        photon.x += 3

        // Remove photons that hit the surface or go off screen
        if (photon.x >= 50 || photon.x > canvas.width) {
          photons.splice(index, 1)

          // Create electron if energy is sufficient
          if (photon.x >= 50 && canEmitElectrons && Math.random() < 0.7) {
            electrons.push({
              x: 200,
              y: photon.y,
              vx: Math.sqrt(maxKineticEnergy) * 2,
              vy: (Math.random() - 0.5) * 2,
              energy: maxKineticEnergy,
              trail: [],
            })
          }
        }
      })

      // Draw electrons with trails and energy-based effects
      electrons.forEach((electron, index) => {
        // Add to trail
        electron.trail.push({ x: electron.x, y: electron.y })
        if (electron.trail.length > 20) electron.trail.shift()

        // Draw electron trail
        ctx.strokeStyle = "#00ffff40"
        ctx.lineWidth = 2
        ctx.beginPath()
        electron.trail.forEach((point, i) => {
          if (i === 0) ctx.moveTo(point.x, point.y)
          else ctx.lineTo(point.x, point.y)
        })
        ctx.stroke()

        // Electron glow based on kinetic energy
        const electronGlow = ctx.createRadialGradient(electron.x, electron.y, 0, electron.x, electron.y, 12)
        const intensity = Math.max(0.3, electron.energy / 5)
        electronGlow.addColorStop(0, `rgba(0, 255, 255, ${intensity})`)
        electronGlow.addColorStop(1, "rgba(0, 255, 255, 0)")

        ctx.fillStyle = electronGlow
        ctx.beginPath()
        ctx.arc(electron.x, electron.y, 12, 0, Math.PI * 2)
        ctx.fill()

        // Electron core
        ctx.fillStyle = "#00ffff"
        ctx.beginPath()
        ctx.arc(electron.x, electron.y, 4, 0, Math.PI * 2)
        ctx.fill()

        // Update electron position
        electron.x += electron.vx
        electron.y += electron.vy
        electron.vy += 0.1 // Gravity effect

        // Remove electrons that go off screen
        if (electron.x > canvas.width || electron.y > canvas.height) {
          electrons.splice(index, 1)
        }
      })

      // Draw collector plate with electric field visualization
      const plateGradient = ctx.createLinearGradient(700, 100, 700, 300)
      plateGradient.addColorStop(0, "#4a90e2")
      plateGradient.addColorStop(1, "#2c5aa0")
      ctx.fillStyle = plateGradient
      ctx.fillRect(700, 100, 20, 200)

      // Electric field lines
      ctx.strokeStyle = "#4a90e240"
      ctx.lineWidth = 1
      for (let i = 0; i < 5; i++) {
        const y = 120 + i * 40
        ctx.beginPath()
        ctx.moveTo(200, y)
        ctx.lineTo(700, y)
        ctx.stroke()
      }

      // Draw energy diagram
      drawEnergyDiagram(ctx)

      animationRef.current = requestAnimationFrame(animate)
    }

    if (isRunning) {
      animate()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [
    isRunning,
    selectedMaterial,
    frequency,
    intensity,
    photons,
    electrons,
    material,
    photonEnergy,
    maxKineticEnergy,
    canEmitElectrons,
  ])

  const drawEnergyDiagram = (ctx) => {
    const diagramX = 50
    const diagramY = 350
    const diagramWidth = 200
    const diagramHeight = 40

    // Background
    ctx.fillStyle = "#00000080"
    ctx.fillRect(diagramX - 10, diagramY - 50, diagramWidth + 20, diagramHeight + 60)

    // Work function bar
    ctx.fillStyle = material.color
    ctx.fillRect(diagramX, diagramY, diagramWidth * 0.4, 20)

    // Photon energy bar
    const photonWidth = Math.min(diagramWidth, (photonEnergy / 8) * diagramWidth)
    ctx.fillStyle = `hsl(${240 + frequency[0] * 10}, 100%, 60%)`
    ctx.fillRect(diagramX, diagramY + 25, photonWidth, 15)

    // Labels with glow
    ctx.shadowColor = "#ffffff"
    ctx.shadowBlur = 5
    ctx.fillStyle = "#ffffff"
    ctx.font = "12px Arial"
    ctx.fillText(`Work Function: ${material.workFunction.toFixed(2)} eV`, diagramX, diagramY - 5)
    ctx.fillText(`Photon Energy: ${photonEnergy.toFixed(2)} eV`, diagramX, diagramY + 55)
    ctx.shadowBlur = 0
  }

  const startSimulation = () => {
    setIsRunning(true)
    setPhotons([])
    setElectrons([])

    // Generate photons based on intensity
    const photonInterval = setInterval(() => {
      if (photons.length < intensity[0] / 10) {
        setPhotons((prev) => [
          ...prev,
          {
            x: 0,
            y: 150 + (Math.random() - 0.5) * 100,
            energy: photonEnergy,
          },
        ])
      }
    }, 100)

    return () => clearInterval(photonInterval)
  }

  const stopSimulation = () => {
    setIsRunning(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  const resetSimulation = () => {
    setIsRunning(false)
    setPhotons([])
    setElectrons([])
    setCurrent(0)
  }

  // Calculate current based on emitted electrons
  useEffect(() => {
    if (canEmitElectrons) {
      setCurrent(electrons.length * 0.1)
      setStoppingVoltage(maxKineticEnergy / 1.6) // Convert eV to volts
    } else {
      setCurrent(0)
      setStoppingVoltage(0)
    }
  }, [electrons.length, canEmitElectrons, maxKineticEnergy])

  const currentReading = voltageData.length ? voltageData[voltageData.length - 1].current : 0

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Photoelectric Effect Simulator
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">Explore Einstein's Nobel Prize-winning discovery</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-800 dark:text-blue-200">Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Target Material
              </label>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full p-3 border-2 border-blue-300 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 transition-all"
              >
                {Object.entries(MATERIALS).map(([key, mat]) => (
                  <option key={key} value={key}>
                    {mat.name} (Φ = {mat.workFunction} eV)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Light Frequency: {frequency[0].toFixed(1)} × 10¹⁴ Hz
              </label>
              <Slider value={frequency} onValueChange={setFrequency} min={1} max={10} step={0.1} className="w-full" />
              <div className="text-xs text-gray-500 mt-1">Photon Energy: {photonEnergy.toFixed(2)} eV</div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Light Intensity: {intensity[0]}%
              </label>
              <Slider value={intensity} onValueChange={setIntensity} min={10} max={100} step={10} className="w-full" />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={startSimulation}
                disabled={isRunning}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                Start
              </Button>
              <Button
                onClick={stopSimulation}
                disabled={!isRunning}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                Stop
              </Button>
              <Button
                onClick={resetSimulation}
                variant="outline"
                className="flex-1 border-2 border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Simulation Canvas */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-black border-2 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Photoelectric Effect Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas
              ref={canvasRef}
              className="w-full border-2 border-gray-600 rounded-lg bg-gradient-to-br from-gray-900 to-black"
              style={{ maxHeight: "400px" }}
            />
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <div className="font-semibold text-blue-800 dark:text-blue-200">Photons</div>
                <div className="text-2xl font-bold text-blue-600">{photons.length}</div>
              </div>
              <div className="text-center p-3 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
                <div className="font-semibold text-cyan-800 dark:text-cyan-200">Electrons</div>
                <div className="text-2xl font-bold text-cyan-600">{electrons.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="lg:col-span-3 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900 dark:to-pink-900 border-2 border-purple-200 dark:border-purple-700">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-purple-800 dark:text-purple-200">
              Measurements & Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Threshold Frequency</div>
                <div className="text-2xl font-bold text-purple-600">{thresholdFreency.toFixed(2)}</div>
                <div className="text-xs text-gray-500">× 10¹⁴ Hz</div>
              </div>

              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Max Kinetic Energy</div>
                <div className="text-2xl font-bold text-green-600">{maxKineticEnergy.toFixed(2)}</div>
                <div className="text-xs text-gray-500">eV</div>
              </div>

              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Photocurrent</div>
                <div className="text-2xl font-bold text-blue-600">{current.toFixed(2)}</div>
                <div className="text-xs text-gray-500">μA</div>
              </div>

              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Stopping Voltage</div>
                <div className="text-2xl font-bold text-red-600">{stoppingVoltage.toFixed(2)}</div>
                <div className="text-xs text-gray-500">V</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl">
              <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-gray-200">
                Einstein's Photoelectric Equation
              </h3>
              <div className="text-center text-xl font-mono bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                E<sub>kinetic</sub> = hf - Φ = {photonEnergy.toFixed(2)} - {material.workFunction} ={" "}
                {maxKineticEnergy.toFixed(2)} eV
              </div>
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center">
                {canEmitElectrons
                  ? "✅ Photon energy exceeds work function - electrons are emitted!"
                  : "❌ Photon energy is below work function - no electron emission"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
