"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import SliderRow from "../ui/SliderRow"

const BANDS = [
  { id: "900mhz", label: "900 MHz", freq: 0.9 },
  { id: "2.4ghz", label: "2.4 GHz", freq: 2.4 },
  { id: "5ghz", label: "5 GHz", freq: 5 },
]

export default function SignalLabSimulator() {
  const [band, setBand] = useState(BANDS[0].id)
  const [amplitude, setAmplitude] = useState(50)
  const [modFreq, setModFreq] = useState(1)
  const [modIndex, setModIndex] = useState(1)
  const canvasRef = useRef(null)
  const animRef = useRef(null)

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
        const t = (x / width) * 4
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
      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [amplitude, modFreq, modIndex, carrierFreq])

  return (
    <motion.div
      className="space-y-6 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-2xl font-bold">Signal Lab</h2>
      <div className="flex flex-col lg:flex-row gap-6">
        <motion.div className="w-full lg:w-1/3 space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Wireless Band</label>
            <select
              value={band}
              onChange={(e) => setBand(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-800"
            >
              {BANDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
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
        </motion.div>
        <motion.div className="w-full lg:w-2/3">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="w-full h-auto border border-gray-300 dark:border-gray-700 rounded-xl shadow-inner"
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
