"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import SliderRow from "../ui/SliderRow"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "../ui/table"

// Split the spectrum into non-ionizing and ionizing categories
const NON_IONIZING_BANDS = [
  { id: "nfc", label: "NFC", freq: 0.01356, penetration: "Very High" },
  { id: "sigfox", label: "Sigfox", freq: 0.868, penetration: "Very High" },
  { id: "zwave", label: "Z-Wave", freq: 0.9, penetration: "Very High" },
  { id: "lora", label: "LoRa", freq: 0.915, penetration: "Very High" },
  { id: "dect", label: "DECT 1.9 GHz", freq: 1.9, penetration: "High" },
  { id: "bluetooth", label: "Bluetooth Classic", freq: 2.4, penetration: "High" },
  { id: "ble", label: "Bluetooth LE", freq: 2.4, penetration: "High" },
  { id: "zigbee", label: "Zigbee", freq: 2.4, penetration: "High" },
  { id: "wifi4-24", label: "Wi-Fi 4 2.4 GHz", freq: 2.4, penetration: "High" },
  { id: "wifi4-5", label: "Wi-Fi 4 5 GHz", freq: 5, penetration: "Medium" },
  { id: "wifi5", label: "Wi-Fi 5 GHz", freq: 5, penetration: "Medium" },
  { id: "wifi6e", label: "Wi-Fi 6E 6 GHz", freq: 6, penetration: "Low" },
  { id: "wifi7", label: "Wi-Fi 7 6 GHz", freq: 6, penetration: "Low" },
  { id: "lte", label: "LTE", freq: 1.8, penetration: "High" },
  { id: "5g-low", label: "5G Low-band", freq: 0.7, penetration: "High" },
  { id: "5g-mid", label: "5G mid-band", freq: 3.5, penetration: "Medium" },
  { id: "5g-mm", label: "5G mmWave", freq: 28, penetration: "Very Low" },
]

const IONIZING_BANDS = [
  { id: "uv", label: "Ultraviolet", freq: 300000, penetration: "Very Low" },
  { id: "xray", label: "X-Ray", freq: 3000000, penetration: "Very Low" },
  { id: "gamma", label: "Gamma Ray", freq: 30000000, penetration: "Very Low" },
]

const BANDS = [...NON_IONIZING_BANDS, ...IONIZING_BANDS]

export default function SignalLabSimulator() {
  const [band, setBand] = useState(BANDS[0].id)
  const [amplitude, setAmplitude] = useState(50)
  const [modFreq, setModFreq] = useState(1)
  const [modIndex, setModIndex] = useState(1)
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const timeRef = useRef(0)

  const carrierFreq = BANDS.find((b) => b.id === band)?.freq || 0.9

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    const width = canvas.width
    const height = canvas.height
    const centerY = height / 2

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.strokeStyle = "#4c6ef5"
      ctx.lineWidth = 2
      ctx.beginPath()

      for (let x = 0; x < width; x++) {
        const t = (x / width) * 4 + timeRef.current
        const y =
          amplitude *
          Math.sin(
            2 * Math.PI * carrierFreq * t +
              modIndex * Math.sin(2 * Math.PI * modFreq * t)
          )
        const posY = centerY - y
        if (x === 0) {
          ctx.moveTo(x, posY)
        } else {
          ctx.lineTo(x, posY)
        }
      }

      ctx.stroke()
      timeRef.current += 0.02
      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [amplitude, modFreq, modIndex, carrierFreq])

  return (
    <motion.div
      className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-purple-100 dark:from-gray-800 dark:to-gray-700 rounded-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-2xl font-bold">Signal Lab</h2>
      <div className="w-full flex justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full max-w-3xl h-auto border border-gray-300 dark:border-gray-700 rounded-xl shadow-inner"
        />
      </div>
      <div className="flex flex-col gap-6 text-sm">
        <div className="space-y-4">
          <label className="text-sm font-medium mb-1 block">Wireless Band</label>
          <select
            value={band}
            onChange={(e) => setBand(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-800"
          >
            <optgroup label="Non-Ionizing">
              {NON_IONIZING_BANDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Ionizing">
              {IONIZING_BANDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </optgroup>
          </select>
          <Table className="text-sm mt-4">
            <TableHeader>
              <TableRow className="bg-indigo-500 text-white">
                <TableHead className="text-white">Band</TableHead>
                <TableHead className="text-white">Freq (GHz)</TableHead>
                <TableHead className="text-white">Penetration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={3} className="font-semibold bg-green-200 dark:bg-green-900">
                  Non-Ionizing
                </TableCell>
              </TableRow>
              {NON_IONIZING_BANDS.map((b) => (
                <TableRow
                  key={b.id}
                  className={
                    b.id === band
                      ? "bg-blue-200 dark:bg-blue-700"
                      : "bg-green-50 dark:bg-green-800"
                  }
                >
                  <TableCell>{b.label}</TableCell>
                  <TableCell>{b.freq}</TableCell>
                  <TableCell>{b.penetration}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="font-semibold bg-red-200 dark:bg-red-900">
                  Ionizing
                </TableCell>
              </TableRow>
              {IONIZING_BANDS.map((b) => (
                <TableRow
                  key={b.id}
                  className={
                    b.id === band
                      ? "bg-blue-200 dark:bg-blue-700"
                      : "bg-red-50 dark:bg-red-800"
                  }
                >
                  <TableCell>{b.label}</TableCell>
                  <TableCell>{b.freq}</TableCell>
                  <TableCell>{b.penetration}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-xs text-gray-500 mt-2">Frequency: {carrierFreq} GHz</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
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
            label="Modulating Freq"
            value={modFreq}
            min={0.1}
            max={5}
            step={0.1}
            onChange={setModFreq}
            unit=" kHz"
          />
          <SliderRow
            label="Modulation Index"
            value={modIndex}
            min={0}
            max={5}
            step={0.1}
            onChange={setModIndex}
          />
        </div>
      </div>
    </motion.div>
  )
}
