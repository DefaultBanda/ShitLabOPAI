"use client"

import { useRef, useState, useEffect } from "react"
import SliderRow from "@/components/ui/SliderRow"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

const TARGETS = {
  Sodium: 2.28,
  Zinc: 4.3,
  Copper: 4.7,
  Platinum: 6.35,
  Calcium: 2.9,
  Unknown: 5,
}

function wavelengthToColor(wl) {
  if (wl < 440) return "#8b00ff"
  if (wl < 490) return "#0000ff"
  if (wl < 510) return "#00ff00"
  if (wl < 580) return "#ffff00"
  if (wl < 645) return "#ff8000"
  return "#ff0000"
}

export default function PhotoelectricEffect() {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const electronsRef = useRef([])
  const photonsRef = useRef([])

  const [wavelength, setWavelength] = useState(400)
  const [intensity, setIntensity] = useState(0)
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
    canvas.width = 480
    canvas.height = 260

    const c = 3e8
    const h = 4.135e-15

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // vacuum tube
      ctx.strokeStyle = "#444"
      ctx.strokeRect(120, 120, 240, 80)
      ctx.fillStyle = "#777"
      ctx.fillRect(130, 135, 20, 50)
      ctx.fillRect(310, 135, 20, 50)

      // circuit wires
      ctx.strokeStyle = "#b45309"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(140, 160)
      ctx.lineTo(140, 230)
      ctx.lineTo(340, 230)
      ctx.lineTo(340, 160)
      ctx.stroke()
      ctx.lineWidth = 1

      // ammeter
      ctx.strokeStyle = "#666"
      ctx.beginPath()
      ctx.arc(240, 230, 12, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = "#222"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("A", 240, 234)

      // flashlight emitter
      const color = wavelengthToColor(wavelength)
      ctx.fillStyle = "#333"
      ctx.fillRect(canvas.width / 2 - 6, 40, 12, 25)
      ctx.fillStyle = "#555"
      ctx.beginPath()
      ctx.moveTo(canvas.width / 2 - 18, 65)
      ctx.lineTo(canvas.width / 2 + 18, 65)
      ctx.lineTo(canvas.width / 2 + 25, 70)
      ctx.lineTo(canvas.width / 2 - 25, 70)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(canvas.width / 2, 70, 12, 0, Math.PI, false)
      ctx.fill()
      ctx.fillStyle = "#000"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`${wavelength} nm`, canvas.width / 2, 95)

      const beamStart = { x: canvas.width / 2, y: 70 }
      const beamEnd = { x: 140, y: 160 }

      if (isPlaying) {
        if (showPhotons) {
          for (let i = 0; i < intensity / 10; i++) {
            photonsRef.current.push({
              x: beamStart.x,
              y: beamStart.y,
              vx: (beamEnd.x - beamStart.x) / 30,
              vy: (beamEnd.y - beamStart.y) / 30,
              color,
            })
          }
        } else {
          ctx.fillStyle = color
          ctx.globalAlpha = intensity / 100
          ctx.beginPath()
          ctx.moveTo(beamStart.x - 20, beamStart.y)
          ctx.lineTo(beamEnd.x, beamEnd.y)
          ctx.lineTo(beamStart.x + 20, beamStart.y)
          ctx.closePath()
          ctx.fill()
          ctx.globalAlpha = 1
        }
      }

      // electron emission
      const freq = c / (wavelength * 1e-9)
      const energy = Math.max(h * freq - TARGETS[target], 0)
      if (isPlaying && energy > 0) {
        for (let i = 0; i < intensity / 20; i++) {
          electronsRef.current.push({
            x: 150,
            y: 145 + Math.random() * 30,
            vx: (energy - Math.max(voltage, 0)) * 5e2,
            vy: (Math.random() - 0.5) * 0.5,
          })
        }
      }

      electronsRef.current.forEach((e) => {
        e.x += e.vx
        e.y += e.vy
      })
      electronsRef.current = electronsRef.current.filter(
        (e) => e.x < 310 && e.y > 120 && e.y < 200 && e.vx > -0.1
      )

      photonsRef.current.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
      })
      photonsRef.current = photonsRef.current.filter(
        (p) =>
          (p.vx < 0 ? p.x > beamEnd.x : p.x < beamEnd.x) &&
          (p.vy < 0 ? p.y > beamEnd.y : p.y < beamEnd.y)
      )

      if (showPhotons) {
        photonsRef.current.forEach((p) => {
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      ctx.fillStyle = showHighest ? "#0af" : "#09f"
      electronsRef.current.forEach((e) => {
        ctx.beginPath()
        ctx.arc(e.x, e.y, 3, 0, Math.PI * 2)
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(render)
    }

    if (isPlaying) {
      render()
    }
    return () => {
      electronsRef.current = []
      photonsRef.current = []
      cancelAnimationFrame(animationRef.current)
    }
  }, [wavelength, intensity, voltage, target, showHighest, isPlaying])

  const currentReading = voltageData.length ? voltageData[voltageData.length - 1].current : 0

  return (
    <div className="border rounded bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between px-3 py-1 border-b bg-gray-100 dark:bg-gray-800 text-sm">
        <span className="font-semibold">Photoelectric Effect</span>
        <div className="space-x-4">
          <button className="hover:underline">File</button>
          <button className="hover:underline">Options</button>
          <button className="hover:underline">Help</button>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <h2 className="text-2xl font-bold">Photoelectric Effect (1.10)</h2>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="space-y-3 lg:w-1/2">
          <canvas ref={canvasRef} className="w-full border rounded bg-white dark:bg-gray-900" />
          <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800">
            <SliderRow
              label="Intensity"
              value={intensity}
              min={0}
              max={100}
              step={5}
              onChange={setIntensity}
              unit="%"
            />
            <SliderRow
              label="Wavelength"
              value={wavelength}
              min={200}
              max={700}
              step={10}
              onChange={setWavelength}
              unit=" nm"
              trackStyle={{
                background:
                  "linear-gradient(to right,#8b00ff,#0000ff,#00ff00,#ffff00,#ff8000,#ff0000)",
              }}
            />
          </div>
          <SliderRow
            label="Voltage"
            value={voltage}
            min={-8}
            max={8}
            step={0.1}
            onChange={setVoltage}
            unit=" V"
          />
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Target</label>
            <select
              className="border rounded px-2 py-1 bg-background"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              {Object.keys(TARGETS).map((t) => (
                <option key={t} value={t}>
                  {t === "Unknown" ? "?????" : t}
                </option>
              ))}
            </select>
            <label className="flex items-center ml-4 text-sm gap-1">
              <input
                type="checkbox"
                checked={showHighest}
                onChange={(e) => setShowHighest(e.target.checked)}
              />
              Show only highest energy electrons
            </label>
            <label className="flex items-center ml-4 text-sm gap-1">
              <input
                type="checkbox"
                checked={showPhotons}
                onChange={(e) => setShowPhotons(e.target.checked)}
              />
              Show photons
            </label>
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="ml-auto px-3 py-1 border rounded"
            >
              {isPlaying ? "\u23F8\uFE0F Pause" : "\u25B6\uFE0F Play"}
            </button>
          </div>
          <div className="text-sm font-mono border border-yellow-400 bg-black text-yellow-300 px-2 py-1 inline-block rounded">
            Current: {currentReading.toFixed(3)}
          </div>
        </div>
        <div className="lg:w-1/2 space-y-4">
          <div>
            <div className="flex items-center text-sm mb-1">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showVoltageGraph}
                  onChange={(e) => setShowVoltageGraph(e.target.checked)}
                  className="mr-1"
                />
                Current vs battery voltage
              </label>
              <span className="ml-auto">🔍</span>
            </div>
            {showVoltageGraph && (
              <LineChart
                width={350}
                height={150}
                data={voltageData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="voltage" label={{ value: "Voltage", position: "insideBottom", dy: 10 }} />
                <YAxis label={{ value: "Current", angle: -90, position: "insideLeft" }} domain={[0, 'dataMax']} />
                <Tooltip />
                <Line type="monotone" dataKey="current" stroke="#8884d8" dot={false} />
              </LineChart>
            )}
          </div>

          <div>
            <div className="flex items-center text-sm mb-1">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showIntensityGraph}
                  onChange={(e) => setShowIntensityGraph(e.target.checked)}
                  className="mr-1"
                />
                Current vs light intensity
              </label>
              <span className="ml-auto">🔍</span>
            </div>
            {showIntensityGraph && (
              <LineChart
                width={350}
                height={150}
                data={intensityData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="intensity" label={{ value: "Intensity", position: "insideBottom", dy: 10 }} />
                <YAxis label={{ value: "Current", angle: -90, position: "insideLeft" }} domain={[0, 'dataMax']} />
                <Tooltip />
                <Line type="monotone" dataKey="current" stroke="#82ca9d" dot={false} />
              </LineChart>
            )}
          </div>

          <div>
            <div className="flex items-center text-sm mb-1">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showEnergyGraph}
                  onChange={(e) => setShowEnergyGraph(e.target.checked)}
                  className="mr-1"
                />
                Electron energy vs light frequency
              </label>
              <span className="ml-auto">🔍</span>
            </div>
            {showEnergyGraph && (
              <LineChart
                width={350}
                height={150}
                data={energyData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="frequency"
                  label={{ value: "Frequency (10^15 Hz)", position: "insideBottom", dy: 10 }}
                />
                <YAxis label={{ value: "Energy (eV)", angle: -90, position: "insideLeft" }} domain={[0, 12]} />
                <Tooltip />
                <Line type="monotone" dataKey="energy" stroke="#ff7300" dot={false} />
              </LineChart>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

