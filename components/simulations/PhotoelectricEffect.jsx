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

  const [wavelength, setWavelength] = useState(400)
  const [intensity, setIntensity] = useState(0)
  const [voltage, setVoltage] = useState(0)
  const [target, setTarget] = useState("Sodium")
  const [showHighest, setShowHighest] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)

  const [voltageData, setVoltageData] = useState([])
  const [intensityData, setIntensityData] = useState([])
  const [energyData, setEnergyData] = useState([])

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
      ctx.strokeStyle = "#444"
      ctx.beginPath()
      ctx.moveTo(150, 160)
      ctx.lineTo(150, 210)
      ctx.lineTo(320, 210)
      ctx.lineTo(320, 160)
      ctx.stroke()

      // flashlight emitter
      const color = wavelengthToColor(wavelength)
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(canvas.width / 2, 70, 20, 0, Math.PI * 2)
      ctx.fill()

      // photons
      if (isPlaying) {
        ctx.strokeStyle = color
        for (let i = 0; i < intensity; i += 10) {
          const y = 120 + Math.random() * 20
          ctx.beginPath()
          ctx.moveTo(canvas.width / 2, y)
          ctx.lineTo(150, y)
          ctx.stroke()
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
      cancelAnimationFrame(animationRef.current)
    }
  }, [wavelength, intensity, voltage, target, showHighest, isPlaying])

  const currentReading = voltageData.length ? voltageData[voltageData.length - 1].current : 0

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Photoelectric Effect (1.10)</h2>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="space-y-3 lg:w-1/2">
          <canvas ref={canvasRef} className="w-full border rounded bg-white dark:bg-gray-900" />
          <div className="grid grid-cols-2 gap-2">
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
            />
            <SliderRow
              label="Voltage"
              value={voltage}
              min={-8}
              max={8}
              step={0.1}
              onChange={setVoltage}
              unit=" V"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Target</label>
            <select
              className="border rounded px-2 py-1 bg-background"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              {Object.keys(TARGETS).map((t) => (
                <option key={t} value={t}>
                  {t}
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
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="ml-auto px-3 py-1 border rounded"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
          </div>
          <div className="text-sm font-mono">Current: {currentReading.toFixed(3)} A</div>
        </div>
        <div className="lg:w-1/2 space-y-4">
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
        </div>
      </div>
    </div>
  )
}

