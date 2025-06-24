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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card"

// Split the spectrum into non-ionizing and ionizing categories
const NON_IONIZING_BANDS = [
  {
    id: "nfc",
    label: "NFC",
    freq: 0.01356,
    penetration: "Very High",
    defaults: { amplitude: 60, modFreq: 0.3, modIndex: 0.8 },
  },
  {
    id: "sigfox",
    label: "Sigfox",
    freq: 0.868,
    penetration: "Very High",
    defaults: { amplitude: 55, modFreq: 0.5, modIndex: 1 },
  },
  {
    id: "zwave",
    label: "Z-Wave",
    freq: 0.9,
    penetration: "Very High",
    defaults: { amplitude: 55, modFreq: 0.6, modIndex: 1 },
  },
  {
    id: "lora",
    label: "LoRa",
    freq: 0.915,
    penetration: "Very High",
    defaults: { amplitude: 55, modFreq: 0.6, modIndex: 1 },
  },
  {
    id: "dect",
    label: "DECT 1.9 GHz",
    freq: 1.9,
    penetration: "High",
    defaults: { amplitude: 50, modFreq: 0.8, modIndex: 1.2 },
  },
  {
    id: "bluetooth",
    label: "Bluetooth Classic",
    freq: 2.4,
    penetration: "High",
    defaults: { amplitude: 45, modFreq: 1, modIndex: 1.2 },
  },
  {
    id: "ble",
    label: "Bluetooth LE",
    freq: 2.4,
    penetration: "High",
    defaults: { amplitude: 45, modFreq: 1, modIndex: 1.1 },
  },
  {
    id: "zigbee",
    label: "Zigbee",
    freq: 2.4,
    penetration: "High",
    defaults: { amplitude: 45, modFreq: 1, modIndex: 1.1 },
  },
  {
    id: "wifi4-24",
    label: "Wi-Fi 4 2.4 GHz",
    freq: 2.4,
    penetration: "High",
    defaults: { amplitude: 45, modFreq: 1.2, modIndex: 1.3 },
  },
  {
    id: "wifi4-5",
    label: "Wi-Fi 4 5 GHz",
    freq: 5,
    penetration: "Medium",
    defaults: { amplitude: 40, modFreq: 1.5, modIndex: 1.4 },
  },
  {
    id: "wifi5",
    label: "Wi-Fi 5 GHz",
    freq: 5,
    penetration: "Medium",
    defaults: { amplitude: 40, modFreq: 1.6, modIndex: 1.4 },
  },
  {
    id: "wifi6e",
    label: "Wi-Fi 6E 6 GHz",
    freq: 6,
    penetration: "Low",
    defaults: { amplitude: 35, modFreq: 1.8, modIndex: 1.6 },
  },
  {
    id: "wifi7",
    label: "Wi-Fi 7 6 GHz",
    freq: 6,
    penetration: "Low",
    defaults: { amplitude: 35, modFreq: 1.8, modIndex: 1.6 },
  },
  {
    id: "lte",
    label: "LTE",
    freq: 1.8,
    penetration: "High",
    defaults: { amplitude: 50, modFreq: 0.8, modIndex: 1.2 },
  },
  {
    id: "5g-low",
    label: "5G Low-band",
    freq: 0.7,
    penetration: "High",
    defaults: { amplitude: 60, modFreq: 0.5, modIndex: 1 },
  },
  {
    id: "5g-mid",
    label: "5G mid-band",
    freq: 3.5,
    penetration: "Medium",
    defaults: { amplitude: 42, modFreq: 1.3, modIndex: 1.3 },
  },
  {
    id: "5g-mm",
    label: "5G mmWave",
    freq: 28,
    penetration: "Very Low",
    defaults: { amplitude: 30, modFreq: 2, modIndex: 2 },
  },
]

const IONIZING_BANDS = [
  {
    id: "uv",
    label: "Ultraviolet",
    freq: 300000,
    penetration: "Very Low",
    defaults: { amplitude: 20, modFreq: 3, modIndex: 2.5 },
  },
  {
    id: "xray",
    label: "X-Ray",
    freq: 3000000,
    penetration: "Very Low",
    defaults: { amplitude: 15, modFreq: 3.5, modIndex: 3 },
  },
  {
    id: "gamma",
    label: "Gamma Ray",
    freq: 30000000,
    penetration: "Very Low",
    defaults: { amplitude: 10, modFreq: 4, modIndex: 3.5 },
  },
]

const BANDS = [...NON_IONIZING_BANDS, ...IONIZING_BANDS]

export default function SignalLabSimulator() {
  const [band, setBand] = useState(BANDS[0].id)
  const [carrierFreq, setCarrierFreq] = useState(BANDS[0].freq)
  const [amplitude, setAmplitude] = useState(BANDS[0].defaults.amplitude)
  const [modFreq, setModFreq] = useState(BANDS[0].defaults.modFreq)
  const [modIndex, setModIndex] = useState(BANDS[0].defaults.modIndex)
  const [phaseShift, setPhaseShift] = useState(0)
  const [speed, setSpeed] = useState(1)
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const timeRef = useRef(0)

  // Update controls when the band changes
  useEffect(() => {
    const selected = BANDS.find((b) => b.id === band)
    if (selected) {
      setCarrierFreq(selected.freq)
      setAmplitude(selected.defaults.amplitude)
      setModFreq(selected.defaults.modFreq)
      setModIndex(selected.defaults.modIndex)
      setPhaseShift(0)
      setSpeed(1)
    }
  }, [band])

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
        const t = (x / width) * speed * 4 + timeRef.current
        const y =
          amplitude *
          Math.sin(
            2 * Math.PI * carrierFreq * t +
              modIndex * Math.sin(2 * Math.PI * modFreq * t + phaseShift)
          )
        const posY = centerY - y
        if (x === 0) {
          ctx.moveTo(x, posY)
        } else {
          ctx.lineTo(x, posY)
        }
      }

      ctx.stroke()
      timeRef.current += 0.02 * speed
      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [amplitude, modFreq, modIndex, phaseShift, speed, carrierFreq])

  return (
    <motion.div
      className="space-y-6 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-2xl font-bold">Signal Lab</h2>
      <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-to-br from-slate-50 to-purple-100 dark:from-gray-800 dark:to-gray-700 border-2 border-purple-200 dark:border-purple-700">
          <CardHeader>
            <CardTitle className="text-lg font-bold">FM Wave</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex justify-center">
            <canvas
              ref={canvasRef}
              width={500}
              height={250}
              className="w-full max-w-lg h-auto border border-gray-300 dark:border-gray-700 rounded-xl shadow-inner"
            />
          </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-50 to-purple-100 dark:from-gray-800 dark:to-gray-700 border-2 border-purple-200 dark:border-purple-700">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Controls</CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <SliderRow
                className="mb-2"
                label="Carrier Freq"
                value={carrierFreq}
                min={0.01}
                max={30}
                step={0.01}
                onChange={setCarrierFreq}
                unit=" GHz"
              />
              <SliderRow
                className="mb-2"
                label="Amplitude"
                value={amplitude}
                min={10}
                max={100}
                step={1}
                onChange={setAmplitude}
                unit=" px"
              />
              <SliderRow
                className="mb-2"
                label="Modulating Freq"
                value={modFreq}
                min={0.1}
                max={5}
                step={0.1}
                onChange={setModFreq}
                unit=" kHz"
              />
              <SliderRow
                className="mb-2"
                label="Modulation Index"
                value={modIndex}
                min={0}
                max={5}
                step={0.1}
                onChange={setModIndex}
              />
              <SliderRow
                className="mb-2"
                label="Phase Shift"
                value={phaseShift}
                min={0}
                max={6.28}
                step={0.1}
                onChange={setPhaseShift}
                unit=" rad"
              />
              <SliderRow
                className="mb-2"
                label="Speed"
                value={speed}
                min={0.5}
                max={2}
                step={0.1}
                onChange={setSpeed}
              />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 text-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">About Signal Lab</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <p>
                This simulator visualizes frequency modulation used by wireless technologies. Select a band to load its default properties, then tweak the variables to see how the carrier wave changes.
              </p>
              <p>
                Non-ionizing waves like Wi-Fi and Bluetooth have much lower frequencies than ionizing waves such as X-rays. Higher frequency generally means less penetration and a shorter wavelength.
              </p>
            </CardContent>
          </Card>
        </div>
        <Card className="lg:row-span-3 bg-gradient-to-br from-blue-50 to-slate-100 dark:from-blue-900 dark:to-slate-800 border-2 border-blue-200 dark:border-blue-700 text-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Wireless Bands</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
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
            </div>
            <Table className="text-xs">
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
            <p className="text-xs text-gray-500">Frequency: {carrierFreq} GHz</p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
