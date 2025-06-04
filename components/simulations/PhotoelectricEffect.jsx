"use client"

import { useRef, useState, useEffect } from "react"
import SliderRow from "@/components/ui/SliderRow"

export default function PhotoelectricEffect() {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const electronsRef = useRef([])

  const [frequency, setFrequency] = useState(500) // THz
  const [intensity, setIntensity] = useState(50)
  const [workFunction, setWorkFunction] = useState(2) // eV

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    canvas.width = 600
    canvas.height = 400

    const h = 4.135e-15 // eV*s

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw metal plate
      ctx.fillStyle = "#888"
      ctx.fillRect(250, 150, 20, 100)

      // Draw photons
      ctx.strokeStyle = "yellow"
      for (let i = 0; i < intensity; i += 10) {
        const y = 180 + Math.random() * 60
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(250, y)
        ctx.stroke()
      }

      const energy = h * frequency * 1e12
      if (energy >= workFunction) {
        for (let i = 0; i < intensity / 20; i++) {
          electronsRef.current.push({
            x: 260,
            y: 180 + Math.random() * 60,
            vx: 2 + Math.random() * 1,
            vy: (Math.random() - 0.5) * 1,
          })
        }
      }

      electronsRef.current.forEach((e) => {
        e.x += e.vx
        e.y += e.vy
      })
      electronsRef.current = electronsRef.current.filter(
        (e) => e.x < canvas.width && e.y > 0 && e.y < canvas.height
      )

      ctx.fillStyle = "#0af"
      electronsRef.current.forEach((e) => {
        ctx.beginPath()
        ctx.arc(e.x, e.y, 3, 0, Math.PI * 2)
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animationRef.current)
  }, [frequency, intensity, workFunction])

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-2/3">
        <canvas
          ref={canvasRef}
          className="w-full border rounded bg-white dark:bg-gray-900"
        />
      </div>
      <div className="w-full lg:w-1/3 space-y-4">
        <h2 className="text-xl font-bold mb-2">Photoelectric Effect</h2>
        <SliderRow
          label="Frequency"
          value={frequency}
          min={100}
          max={1000}
          step={10}
          onChange={setFrequency}
          unit=" THz"
        />
        <SliderRow
          label="Intensity"
          value={intensity}
          min={0}
          max={100}
          step={5}
          onChange={setIntensity}
        />
        <SliderRow
          label="Work Function"
          value={workFunction}
          min={1}
          max={5}
          step={0.1}
          onChange={setWorkFunction}
          unit=" eV"
        />
      </div>
    </div>
  )
}

