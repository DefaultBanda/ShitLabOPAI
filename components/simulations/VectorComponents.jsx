"use client"
import { useRef, useEffect } from "react"
import { motion } from "framer-motion"

function VectorComponents({ angle, speed, currentVx, currentVy, isLaunched }) {
  const canvasRef = useRef(null)

  // Calculate initial velocity components
  const initialVx = speed * Math.cos((angle * Math.PI) / 180)
  const initialVy = speed * Math.sin((angle * Math.PI) / 180)

  // Use current values if launched, otherwise use initial values
  const vx = isLaunched ? currentVx : initialVx
  const vy = isLaunched ? -currentVy : initialVy // Negate because canvas Y is inverted

  // Format velocity to 1 decimal place
  const formatVelocity = (v) => {
    return Math.abs(v) < 0.1 ? "0.0" : v.toFixed(1)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set origin at center
    const originX = canvas.width / 2
    const originY = canvas.height / 2

    // Scale factor for vectors (pixels per m/s)
    const scale = 4

    // Calculate vector endpoints
    const vMag = Math.hypot(vx, vy)
    const vAngle = Math.atan2(vy, vx)

    const vEndX = originX + vx * scale
    const vEndY = originY - vy * scale // Subtract because canvas Y is inverted

    const vxEndX = originX + vx * scale
    const vxEndY = originY

    const vyEndX = originX
    const vyEndY = originY - vy * scale // Subtract because canvas Y is inverted

    // Draw coordinate axes
    ctx.save()
    ctx.strokeStyle = "#888888"
    ctx.lineWidth = 1

    // X-axis
    ctx.beginPath()
    ctx.moveTo(20, originY)
    ctx.lineTo(canvas.width - 20, originY)
    ctx.stroke()

    // Y-axis
    ctx.beginPath()
    ctx.moveTo(originX, canvas.height - 20)
    ctx.lineTo(originX, 20)
    ctx.stroke()

    // Axis labels
    ctx.fillStyle = "#888888"
    ctx.font = "12px Arial"
    ctx.fillText("X", canvas.width - 15, originY + 15)
    ctx.fillText("Y", originX + 5, 15)

    // Draw velocity vector (total)
    ctx.strokeStyle = "#ff6b6b"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(originX, originY)
    ctx.lineTo(vEndX, vEndY)
    ctx.stroke()

    // Draw arrowhead for velocity vector
    const headLength = 10
    const headAngle = Math.PI / 6

    ctx.beginPath()
    ctx.moveTo(vEndX, vEndY)
    ctx.lineTo(
      vEndX - headLength * Math.cos(vAngle - headAngle),
      vEndY + headLength * Math.sin(vAngle - headAngle), // Add because canvas Y is inverted
    )
    ctx.lineTo(
      vEndX - headLength * Math.cos(vAngle + headAngle),
      vEndY + headLength * Math.sin(vAngle + headAngle), // Add because canvas Y is inverted
    )
    ctx.closePath()
    ctx.fillStyle = "#ff6b6b"
    ctx.fill()

    // Draw X component
    ctx.strokeStyle = "#4ecdc4"
    ctx.lineWidth = 2
    ctx.setLineDash([5, 3])
    ctx.beginPath()
    ctx.moveTo(originX, originY)
    ctx.lineTo(vxEndX, vxEndY)
    ctx.stroke()

    // Draw Y component
    ctx.strokeStyle = "#ffbe0b"
    ctx.beginPath()
    ctx.moveTo(originX, originY)
    ctx.lineTo(vyEndX, vyEndY)
    ctx.stroke()

    // Reset line dash
    ctx.setLineDash([])

    // Draw projection lines
    ctx.strokeStyle = "#aaaaaa"
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])

    // Vertical projection from total vector to X-axis
    ctx.beginPath()
    ctx.moveTo(vEndX, vEndY)
    ctx.lineTo(vEndX, originY)
    ctx.stroke()

    // Horizontal projection from total vector to Y-axis
    ctx.beginPath()
    ctx.moveTo(vEndX, vEndY)
    ctx.lineTo(originX, vEndY)
    ctx.stroke()

    ctx.restore()
  }, [vx, vy, angle, speed, isLaunched])

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center">
      <div className="w-full md:w-1/2">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="w-full h-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
        />
      </div>

      <div className="w-full md:w-1/2 space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Velocity</h4>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-400 mr-2"></div>
            <motion.div
              key={`v-${Math.hypot(vx, vy).toFixed(1)}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-mono"
            >
              {formatVelocity(Math.hypot(vx, vy))} m/s
            </motion.div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">X Component</h4>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-teal-400 mr-2"></div>
            <motion.div
              key={`vx-${vx.toFixed(1)}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-mono"
            >
              {formatVelocity(vx)} m/s
            </motion.div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Y Component</h4>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-yellow-400 mr-2"></div>
            <motion.div
              key={`vy-${vy.toFixed(1)}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-mono"
            >
              {formatVelocity(vy)} m/s
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VectorComponents
