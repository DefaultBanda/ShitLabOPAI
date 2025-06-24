"use client"

import { useRef, useState, useEffect } from "react"
import SliderRow from "@/components/ui/SliderRow"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts"

const BANDS = [
  { name: "Z-Wave", freq: 0.9, penetration: "Very High" },
  { name: "LoRa", freq: 0.915, penetration: "Very High" },
  { name: "Bluetooth", freq: 2.4, penetration: "High" },
  { name: "Zigbee", freq: 2.4, penetration: "High" },
  { name: "Wi-Fi 2.4 GHz", freq: 2.4, penetration: "High" },
  { name: "Wi-Fi 5 GHz", freq: 5, penetration: "Medium" },
  { name: "Wi-Fi 6E 6 GHz", freq: 6, penetration: "Low" },
  { name: "LTE", freq: 1.8, penetration: "High" },
  { name: "5G Low-band", freq: 0.7, penetration: "High" },
  { name: "5G mid-band", freq: 3.5, penetration: "Medium" },
  { name: "5G mmWave", freq: 28, penetration: "Very Low" },
]

const PEN_LEVEL = {
  "Very Low": 20,
  Low: 40,
  Medium: 60,
  High: 80,
  "Very High": 100,
}

export default function SignalLab() {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const timeRef = useRef(0)
  const [carrierFreq, setCarrierFreq] = useState(5)
  const [modFreq, setModFreq] = useState(1)
  const [modIndex, setModIndex] = useState(0.5)
  const [isPlaying, setIsPlaying] = useState(true)
  const [waveData, setWaveData] = useState([])
  const [spectrumData, setSpectrumData] = useState([])
  const [bandIndex, setBandIndex] = useState(0)

  // Compute spectrum every few frames
  const computeSpectrum = (samples) => {
    const N = samples.length
    const result = []
    for (let k = 0; k < 20; k++) {
      let re = 0
      let im = 0
      for (let n = 0; n < N; n++) {
        const angle = (-2 * Math.PI * k * n) / N
        re += samples[n] * Math.cos(angle)
        im += samples[n] * Math.sin(angle)
      }
      const mag = Math.sqrt(re * re + im * im) / N
      result.push({ freq: k, mag })
    }
    return result
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    const width = canvas.width
    const height = canvas.height
    const centerY = height / 2

    const samples = []

    const render = () => {
      if (!isPlaying) return
      ctx.clearRect(0, 0, width, height)
      const time = timeRef.current
      const dt = 0.02
      const amp = 80
      const newSamples = []
      ctx.beginPath()
      for (let x = 0; x < width; x++) {
        const t = time + (x / width) * 2
        const y = (1 + modIndex * Math.sin(2 * Math.PI * modFreq * t)) * Math.sin(2 * Math.PI * carrierFreq * t)
        newSamples.push(y)
        const py = centerY - y * amp
        if (x === 0) ctx.moveTo(x, py)
        else ctx.lineTo(x, py)
      }
      ctx.strokeStyle = "#2563eb"
      ctx.lineWidth = 2
      ctx.stroke()
      timeRef.current += dt
      setWaveData(newSamples.map((y, i) => ({ t: i / width, y })))
      setSpectrumData(computeSpectrum(newSamples))
      animationRef.current = requestAnimationFrame(render)
    }
    render()
    return () => cancelAnimationFrame(animationRef.current)
  }, [carrierFreq, modFreq, modIndex, isPlaying])

  const band = BANDS[bandIndex]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-center">Signal Lab</h2>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/2 space-y-4">
          <canvas
            ref={canvasRef}
            width={600}
            height={300}
            className="w-full border rounded bg-white dark:bg-gray-900"
          />
          <SliderRow
            label="Carrier Frequency"
            value={carrierFreq}
            min={1}
            max={10}
            step={0.1}
            onChange={setCarrierFreq}
            unit=" Hz"
          />
          <SliderRow
            label="Modulation Frequency"
            value={modFreq}
            min={0}
            max={5}
            step={0.1}
            onChange={setModFreq}
            unit=" Hz"
          />
          <SliderRow
            label="Modulation Index"
            value={modIndex}
            min={0}
            max={1}
            step={0.05}
            onChange={setModIndex}
          />
          <button onClick={() => setIsPlaying((p) => !p)} className="px-3 py-1 border rounded">
            {isPlaying ? "\u23F8\uFE0F Pause" : "\u25B6\uFE0F Play"}
          </button>
        </div>
        <div className="lg:w-1/2 space-y-4">
          <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800 space-y-3">
            <h3 className="text-lg font-semibold">Frequency Spectrum</h3>
            <BarChart width={350} height={200} data={spectrumData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="freq" label={{ value: "Harmonic", position: "insideBottom", dy: 10 }} />
              <YAxis label={{ value: "Magnitude", angle: -90, position: "insideLeft" }} domain={[0, 'dataMax']} />
              <Tooltip />
              <Bar dataKey="mag" fill="#38bdf8" />
            </BarChart>
          </div>
          <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800 space-y-3">
            <h3 className="text-lg font-semibold">Wireless Bands</h3>
            <label className="block text-sm font-medium">Select Band
              <select
                value={bandIndex}
                onChange={(e) => setBandIndex(parseInt(e.target.value))}
                className="mt-1 w-full p-2 border rounded bg-background"
              >
                {BANDS.map((b, i) => (
                  <option key={b.name} value={i}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="text-sm">Frequency: {band.freq} GHz</div>
            <div className="text-sm">Penetration: {band.penetration}</div>
            <div className="h-2 w-full bg-gray-300 rounded">
              <div
                className="h-2 rounded bg-blue-500"
                style={{ width: `${PEN_LEVEL[band.penetration]}%` }}
              />
            </div>
            <table className="w-full text-sm border mt-4">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-2 py-1 text-left">Band</th>
                  <th className="px-2 py-1">Freq (GHz)</th>
                  <th className="px-2 py-1 text-left">Penetration</th>
                </tr>
              </thead>
              <tbody>
                {BANDS.map((b) => (
                  <tr key={b.name} className="border-t">
                    <td className="px-2 py-1">{b.name}</td>
                    <td className="px-2 py-1 text-center">{b.freq}</td>
                    <td className="px-2 py-1">{b.penetration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
