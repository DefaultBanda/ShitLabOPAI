"use client"

import { useEffect, useRef } from "react"

export default function ProjectileCanvas({
  angle,
  speed,
  gravity,
  initialHeight = 0,
  advanced = false,
  mass = 1,
  Cd = 0.47,
  area = 0.01,
  wind = 0,
  airResistance = 0.1,
  launchKey = 0,
  onFrame,
  isLaunched = false,
  onComplete,
}) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const stateRef = useRef({
    time: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    lastReportedVx: null,
    lastReportedVy: null,
    path: [],
    particles: [],
    isLaunched: false,
    isGrounded: false,
    maxHeight: 0,
    groundY: 0,
  })

  // Track timestamp for variable frame timing
  const lastTimeRef = useRef(null)

  // Scaling factor (pixels per meter)
  const SCALE = 20

  // Initialize canvas and start animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const state = stateRef.current

    // Convert angle to radians and set initial velocities
    const angleRad = (angle * Math.PI) / 180
    state.vx = speed * Math.cos(angleRad)
    state.vy = -speed * Math.sin(angleRad) // Negative because canvas y is inverted

    // Reset state for new launch
    state.time = 0
    state.x = 2 // Starting x position in meters

    // Calculate y position based on initial height
    const groundY = canvas.height - 20
    const initialHeightPixels = initialHeight * SCALE
    state.y = groundY - initialHeightPixels
    state.groundY = groundY
    state.maxHeight = initialHeight

    state.path = [[state.x * SCALE, state.y]]
    state.particles = []
    state.isLaunched = isLaunched
    state.isGrounded = false

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    // Start animation loop
    const animate = (timestamp) => {
      if (lastTimeRef.current == null) lastTimeRef.current = timestamp
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05)
      lastTimeRef.current = timestamp
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw grid
      drawGrid(ctx, canvas.width, canvas.height)

      // Draw trajectory
      drawTrajectory(ctx, state.path)

      // Update physics if launched and not grounded
      if (state.isLaunched && !state.isGrounded) {

        if (advanced) {
          // Advanced physics with air resistance and wind
          const rho = 1.225 // Air density in kg/m³

          // Calculate relative velocity (accounting for wind)
          const vRelX = state.vx - wind
          const vRelY = state.vy
          const vRelMag = Math.hypot(vRelX, vRelY)

          // Calculate drag force with air resistance factor
          const dragForce = 0.5 * rho * Cd * area * vRelMag * vRelMag * airResistance

          // Calculate accelerations
          const ax = -(dragForce / mass) * (vRelX / vRelMag)
          const ay = -(dragForce / mass) * (vRelY / vRelMag) + gravity // Note: gravity is positive downward

          // Update velocities
          state.vx += ax * dt
          state.vy += ay * dt
        } else {
          // Classic physics (constant vx, gravity affects vy)
          state.vy += gravity * dt
        }

        // Update position (in meters)
        state.x += state.vx * dt
        state.y += state.vy * dt * SCALE // Convert y to pixels for display

        const currentHeight = (state.groundY - state.y) / SCALE
        if (currentHeight > state.maxHeight) {
          state.maxHeight = currentHeight
        }

        // Add point to trajectory (convert x to pixels for display)
        state.path.push([state.x * SCALE, state.y])

        // Add particles
        if (Math.random() < 0.3) {
          state.particles.push({
            x: state.x * SCALE,
            y: state.y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 3 + 1,
            life: 1.0,
          })
        }

        // Update particles
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const p = state.particles[i]
          p.x += p.vx
          p.y += p.vy
          p.life -= 0.02
          if (p.life <= 0) {
            state.particles.splice(i, 1)
          }
        }

        // Check if ball hit the ground
        if (state.y >= state.groundY) {
          state.y = state.groundY
          state.isGrounded = true

          // Create impact particles
          for (let i = 0; i < 20; i++) {
            state.particles.push({
              x: state.x * SCALE,
              y: state.y,
              vx: (Math.random() - 0.5) * 6,
              vy: -Math.random() * 5,
              size: Math.random() * 4 + 2,
              life: 1.0,
            })
          }

          if (typeof onComplete === "function") {
            onComplete({
              time: state.time,
              range: state.x - 2,
              maxHeight: state.maxHeight,
            })
          }
        }

        // Update time
        state.time += dt

        // Call onFrame callback with current velocities, but only if values have changed significantly
        if (typeof onFrame === "function") {
          // Only update if velocity has changed by more than 0.1 m/s
          if (
            !state.lastReportedVx ||
            !state.lastReportedVy ||
            Math.abs(state.vx - state.lastReportedVx) > 0.1 ||
            Math.abs(state.vy - state.lastReportedVy) > 0.1
          ) {
            state.lastReportedVx = state.vx
            state.lastReportedVy = state.vy
            onFrame(state.vx, state.vy)
          }
        }
      }

      // Draw particles
      drawParticles(ctx, state.particles)

      // Draw launch arrow
      drawLaunchArrow(ctx, 2 * SCALE, state.y, angle)

      // Draw ball at current position
      drawBall(ctx, state.x * SCALE, state.y)

      // Draw ground level
      drawGround(ctx, canvas.width, canvas.height)

      // Draw wind indicator if advanced mode is on
      if (advanced) {
        drawWindIndicator(ctx, canvas.width - 100, 50, wind)
      }

      // Continue animation
      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animationRef.current = requestAnimationFrame(animate)

    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      lastTimeRef.current = null
    }
  }, [
    angle,
    speed,
    gravity,
    initialHeight,
    advanced,
    mass,
    Cd,
    area,
    wind,
    airResistance,
    launchKey,
    isLaunched,
    onComplete,
  ])

  // Draw grid lines
  const drawGrid = (ctx, width, height) => {
    ctx.save()
    ctx.strokeStyle = "#333333"
    ctx.lineWidth = 0.5
    ctx.globalAlpha = 0.2

    // Draw vertical lines (every meter)
    for (let x = 0; x <= width; x += SCALE) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += SCALE) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    ctx.restore()
  }

  // Draw ground level
  const drawGround = (ctx, width, height) => {
    ctx.save()
    ctx.fillStyle = "#d1d5db"
    ctx.fillRect(0, height - 20, width, 20)

    // Draw ruler marks
    ctx.fillStyle = "#6b7280"
    for (let x = 0; x < width; x += SCALE) {
      const tickHeight = x % (SCALE * 5) === 0 ? 10 : 5
      ctx.fillRect(x, height - 20, 1, tickHeight)

      // Add labels every 5 meters
      if (x % (SCALE * 5) === 0) {
        ctx.fillText(`${x / SCALE}m`, x - 10, height - 5)
      }
    }

    ctx.restore()
  }

  // Draw trajectory path
  const drawTrajectory = (ctx, path) => {
    if (path.length < 2) return

    ctx.save()

    // Create gradient for trajectory
    const gradient = ctx.createLinearGradient(
      path[0][0],
      path[0][1],
      path[path.length - 1][0],
      path[path.length - 1][1],
    )
    gradient.addColorStop(0, "#3b82f6")
    gradient.addColorStop(1, "#f97316")

    ctx.strokeStyle = gradient
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(path[0][0], path[0][1])

    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i][0], path[i][1])
    }

    ctx.stroke()
    ctx.restore()
  }

  // Draw particles
  const drawParticles = (ctx, particles) => {
    ctx.save()

    for (const p of particles) {
      ctx.globalAlpha = p.life
      ctx.fillStyle = "#f97316"
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }

  // Draw launch arrow
  const drawLaunchArrow = (ctx, x, y, angle) => {
    const length = 40
    const angleRad = (angle * Math.PI) / 180
    const endX = x + length * Math.cos(angleRad)
    const endY = y - length * Math.sin(angleRad) // Subtract because canvas y is inverted

    ctx.save()

    // Create gradient for arrow
    const gradient = ctx.createLinearGradient(x, y, endX, endY)
    gradient.addColorStop(0, "#3b82f6")
    gradient.addColorStop(1, "#06b6d4")
    ctx.strokeStyle = gradient
    ctx.lineWidth = 3

    // Draw line
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(endX, endY)
    ctx.stroke()

    // Draw arrowhead
    const headLength = 12
    const headAngle = Math.PI / 6

    const angle1 = angleRad - Math.PI + headAngle
    const angle2 = angleRad - Math.PI - headAngle

    ctx.fillStyle = "#06b6d4"
    ctx.beginPath()
    ctx.moveTo(endX, endY)
    ctx.lineTo(endX + headLength * Math.cos(angle1), endY - headLength * Math.sin(angle1))
    ctx.lineTo(endX + headLength * Math.cos(angle2), endY - headLength * Math.sin(angle2))
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  }

  // Draw ball
  const drawBall = (ctx, x, y) => {
    ctx.save()

    // Ball gradient
    const gradient = ctx.createRadialGradient(x - 3, y - 3, 1, x, y, 10)
    gradient.addColorStop(0, "#ffffff")
    gradient.addColorStop(1, "#3b82f6")

    ctx.fillStyle = gradient
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
    ctx.shadowBlur = 5
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2

    ctx.beginPath()
    ctx.arc(x, y, 8, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  // Draw wind indicator
  const drawWindIndicator = (ctx, x, y, windSpeed) => {
    ctx.save()

    // Scale wind for visualization
    const scaledWind = windSpeed / 5

    ctx.fillStyle = "#64748b"
    ctx.font = "14px Arial"
    ctx.textAlign = "center"
    ctx.fillText(`Wind: ${windSpeed.toFixed(1)} m/s`, x, y - 15)

    // Draw arrow
    const arrowLength = Math.min(Math.max(Math.abs(scaledWind) * 20, 10), 50) * Math.sign(scaledWind)

    ctx.strokeStyle = "#64748b"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x - arrowLength, y)
    ctx.lineTo(x, y)
    ctx.stroke()

    // Draw arrowhead
    const headLength = 8
    const headAngle = Math.PI / 6

    if (scaledWind !== 0) {
      const arrowDir = scaledWind > 0 ? 0 : Math.PI

      ctx.fillStyle = "#64748b"
      ctx.beginPath()
      ctx.moveTo(x - arrowLength, y)
      ctx.lineTo(
        x - arrowLength + headLength * Math.cos(arrowDir + headAngle),
        y + headLength * Math.sin(arrowDir + headAngle),
      )
      ctx.lineTo(
        x - arrowLength + headLength * Math.cos(arrowDir - headAngle),
        y + headLength * Math.sin(arrowDir - headAngle),
      )
      ctx.closePath()
      ctx.fill()
    }

    ctx.restore()
  }

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={400}
      className="w-full h-auto border border-gray-300 dark:border-gray-700 rounded-xl shadow-inner dark:bg-gray-900"
    />
  )
}
