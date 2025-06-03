"use client"

import { useRef, useState, useEffect } from "react"
import SliderRow from "@/components/ui/SliderRow"

export default function MagneticFieldsSimulator() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const animationRef = useRef(null)
  const [magnets, setMagnets] = useState([
    { id: 1, type: "bar", x: 200, y: 200, rotation: 0, strength: 100, width: 100, height: 30 },
  ])
  const [electromagnets, setElectromagnets] = useState([
    { id: 1, type: "solenoid", x: 400, y: 200, rotation: 0, current: 50, on: true, radius: 40 },
  ])
  const [compasses, setCompasses] = useState([
    { id: 1, x: 300, y: 300, radius: 15 },
    { id: 2, x: 500, y: 300, radius: 15 },
    { id: 3, x: 300, y: 400, radius: 15 },
    { id: 4, x: 500, y: 400, radius: 15 },
  ])

  const [activeDrag, setActiveDrag] = useState(null)
  const [showFieldLines, setShowFieldLines] = useState(true)
  const [showCompasses, setShowCompasses] = useState(true)
  const [showPoleMarkers, setShowPoleMarkers] = useState(true)
  const [fieldDensity, setFieldDensity] = useState(20)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [particleCount, setParticleCount] = useState(200)
  const [particleSpeed, setParticleSpeed] = useState(1)
  const [showGrid, setShowGrid] = useState(true)

  // Particles for field visualization
  const particlesRef = useRef([])

  const compassesRef = useRef(compasses)

  // Initialize particles
  useEffect(() => {
    initializeParticles()
  }, [particleCount])

  const initializeParticles = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const width = canvas.width
    const height = canvas.height

    const newParticles = []
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        age: Math.random() * 100,
        history: [],
      })
    }
    particlesRef.current = newParticles
  }

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        canvasRef.current.width = width
        canvasRef.current.height = height

        // Reinitialize particles when canvas size changes
        initializeParticles()
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const width = canvas.width
    const height = canvas.height

    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw background grid
      if (showGrid) {
        drawGrid(ctx, width, height)
      }

      // Draw field visualization if enabled
      if (showFieldLines) {
        if (showHeatmap) {
          drawFieldHeatmap(ctx, width, height)
        }
        updateAndDrawParticles(ctx)
      }

      // Update compass directions
      updateCompasses()

      // Draw magnets and electromagnets
      drawMagnets(ctx)
      drawElectromagnets(ctx)

      // Draw compasses
      if (showCompasses) {
        drawCompasses(ctx)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [
    magnets,
    electromagnets,
    compasses,
    showFieldLines,
    showPoleMarkers,
    fieldDensity,
    showHeatmap,
    particleSpeed,
    showCompasses,
    showGrid,
  ])

  // Draw background grid
  const drawGrid = (ctx, width, height) => {
    ctx.strokeStyle = "#e5e5e5"
    ctx.lineWidth = 0.5

    const gridSize = 40

    ctx.beginPath()
    for (let x = 0; x <= width; x += gridSize) {
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
    }
    ctx.stroke()
  }

  // Calculate magnetic field at a point
  const calculateField = (x, y) => {
    let fieldX = 0
    let fieldY = 0

    // Calculate field from bar magnets
    magnets.forEach((magnet) => {
      // Convert rotation to radians
      const rotationRad = (magnet.rotation * Math.PI) / 180

      // Calculate the vector from magnet center to the point
      const dx = x - magnet.x
      const dy = y - magnet.y

      // Rotate the point to align with magnet orientation
      const rotatedDx = dx * Math.cos(-rotationRad) - dy * Math.sin(-rotationRad)
      const rotatedDy = dx * Math.sin(-rotationRad) + dy * Math.cos(-rotationRad)

      // Distance from the point to the magnet center
      const distance = Math.sqrt(rotatedDx * rotatedDx + rotatedDy * rotatedDy)

      if (distance < 5) return { x: 0, y: 0, strength: 0 } // Avoid division by zero

      // Simplified dipole field calculation
      const fieldStrength = magnet.strength / (distance * distance)

      // Direction of the field (from north to south)
      let fx = rotatedDx * fieldStrength
      const fy = rotatedDy * fieldStrength

      // Adjust field direction based on position relative to poles
      if (Math.abs(rotatedDx) > magnet.width / 2) {
        fx *= -1
      }

      // Rotate the field vector back
      fieldX += fx * Math.cos(rotationRad) - fy * Math.sin(rotationRad)
      fieldY += fx * Math.sin(rotationRad) + fy * Math.cos(rotationRad)
    })

    // Calculate field from electromagnets
    electromagnets.forEach((em) => {
      if (!em.on) return

      const dx = x - em.x
      const dy = y - em.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 5) return

      let fieldStrength = 0

      if (em.type === "solenoid") {
        // Simplified solenoid field (stronger and more directional)
        fieldStrength = (em.current * 1.5) / (distance * distance)

        // Solenoid axis direction (based on rotation)
        const rotationRad = (em.rotation * Math.PI) / 180
        const axisX = Math.cos(rotationRad)
        const axisY = Math.sin(rotationRad)

        // Field is strongest along the axis
        const dotProduct = dx * axisX + dy * axisY
        const axisAlignment = Math.abs(dotProduct) / distance

        fieldX += axisX * fieldStrength * axisAlignment * Math.sign(em.current)
        fieldY += axisY * fieldStrength * axisAlignment * Math.sign(em.current)
      }
    })

    // Normalize the field vector for direction
    const magnitude = Math.sqrt(fieldX * fieldX + fieldY * fieldY)
    if (magnitude > 0) {
      const normalizedX = fieldX / magnitude
      const normalizedY = fieldY / magnitude
      return { x: normalizedX, y: normalizedY, strength: magnitude }
    }

    return { x: 0, y: 0, strength: 0 }
  }

  // Update compass directions
  const updateCompasses = () => {
    const updatedCompasses = compassesRef.current.map((compass) => {
      const field = calculateField(compass.x, compass.y)

      // Calculate angle from field vector
      let angle = 0
      if (field.strength > 0) {
        angle = Math.atan2(field.y, field.x) * (180 / Math.PI)
      }

      return {
        ...compass,
        angle: angle,
      }
    })

    compassesRef.current = updatedCompasses
    // Only update state when compasses are moved, not during animation
    if (JSON.stringify(updatedCompasses) !== JSON.stringify(compasses)) {
      setCompasses(updatedCompasses)
    }
  }

  // Update and draw particles for field visualization
  const updateAndDrawParticles = (ctx) => {
    // Update particles without using setState
    particlesRef.current = particlesRef.current.map((particle) => {
      // Calculate field at particle position
      const field = calculateField(particle.x, particle.y)

      // Update particle position based on field
      const newX = particle.x + field.x * particleSpeed * 2
      const newY = particle.y + field.y * particleSpeed * 2

      // Store position history for trail
      const history = [...particle.history, { x: particle.x, y: particle.y }]
      if (history.length > 10) {
        history.shift()
      }

      // Check if particle is out of bounds
      const isOutOfBounds = newX < 0 || newX > ctx.canvas.width || newY < 0 || newY > ctx.canvas.height

      // Reset particle if it's out of bounds or too old
      if (isOutOfBounds || particle.age > 100) {
        return {
          ...particle,
          x: Math.random() * ctx.canvas.width,
          y: Math.random() * ctx.canvas.height,
          age: 0,
          history: [],
        }
      }

      // Return updated particle
      return {
        ...particle,
        x: newX,
        y: newY,
        age: particle.age + 1,
        history,
      }
    })

    // Draw particles and their trails
    particlesRef.current.forEach((particle) => {
      // Draw trail
      if (particle.history.length > 1) {
        ctx.beginPath()
        ctx.moveTo(particle.history[0].x, particle.history[0].y)

        for (let i = 1; i < particle.history.length; i++) {
          ctx.lineTo(particle.history[i].x, particle.history[i].y)
        }

        ctx.lineTo(particle.x, particle.y)

        // Gradient based on field strength
        const field = calculateField(particle.x, particle.y)
        const normalizedStrength = Math.min(field.strength * 5, 1)

        // Blue for north-dominated fields, red for south-dominated
        const hue = 240 - normalizedStrength * 240
        ctx.strokeStyle = `hsla(${hue}, 100%, 50%, 0.3)`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Draw particle
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2)
      ctx.fillStyle = "white"
      ctx.fill()
    })
  }

  // Draw field heatmap
  const drawFieldHeatmap = (ctx, width, height) => {
    const resolution = 20
    const cellWidth = width / resolution
    const cellHeight = height / resolution

    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const x = (i + 0.5) * cellWidth
        const y = (j + 0.5) * cellHeight

        const field = calculateField(x, y)
        const intensity = Math.min(field.strength * 5, 1)

        ctx.fillStyle = `rgba(0, 0, 255, ${intensity * 0.5})`
        ctx.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight)
      }
    }
  }

  // Draw bar magnets
  const drawMagnets = (ctx) => {
    magnets.forEach((magnet) => {
      ctx.save()

      // Translate and rotate to magnet position and orientation
      ctx.translate(magnet.x, magnet.y)
      ctx.rotate((magnet.rotation * Math.PI) / 180)

      // Draw magnet body
      ctx.fillStyle = "#d4d4d8"
      ctx.strokeStyle = "#71717a"
      ctx.lineWidth = 2

      const halfWidth = magnet.width / 2
      const halfHeight = magnet.height / 2

      ctx.beginPath()
      ctx.rect(-halfWidth, -halfHeight, magnet.width, magnet.height)
      ctx.fill()
      ctx.stroke()

      // Draw north pole (blue)
      ctx.fillStyle = "#3b82f6"
      ctx.beginPath()
      ctx.rect(-halfWidth, -halfHeight, magnet.width / 2, magnet.height)
      ctx.fill()

      // Draw south pole (red)
      ctx.fillStyle = "#ef4444"
      ctx.beginPath()
      ctx.rect(0, -halfHeight, magnet.width / 2, magnet.height)
      ctx.fill()

      // Draw pole markers if enabled
      if (showPoleMarkers) {
        ctx.fillStyle = "white"
        ctx.font = "16px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        ctx.fillText("N", -halfWidth / 2, 0)
        ctx.fillText("S", halfWidth / 2, 0)
      }

      ctx.restore()
    })
  }

  // Draw electromagnets
  const drawElectromagnets = (ctx) => {
    electromagnets.forEach((em) => {
      ctx.save()

      // Translate and rotate to electromagnet position and orientation
      ctx.translate(em.x, em.y)
      ctx.rotate((em.rotation * Math.PI) / 180)

      if (em.type === "solenoid") {
        // Draw solenoid
        ctx.strokeStyle = em.on ? "#71717a" : "#a1a1aa"
        ctx.lineWidth = 3

        // Draw coil
        for (let i = -5; i <= 5; i++) {
          ctx.beginPath()
          ctx.ellipse(i * 5, 0, em.radius, em.radius / 3, 0, 0, Math.PI * 2)
          ctx.stroke()
        }

        // Draw core
        ctx.strokeStyle = "#78716c"
        ctx.lineWidth = 6
        ctx.beginPath()
        ctx.moveTo(-30, 0)
        ctx.lineTo(30, 0)
        ctx.stroke()

        // Draw current direction indicators
        if (em.on) {
          const currentColor = em.current > 0 ? "#3b82f6" : "#ef4444"
          ctx.fillStyle = currentColor

          // Draw arrows indicating current direction
          const arrowDirection = em.current > 0 ? 1 : -1

          for (let i = -4; i <= 4; i += 2) {
            drawArrow(ctx, i * 7, -em.radius, 0, arrowDirection * 10, currentColor)
            drawArrow(ctx, i * 7, em.radius, 0, -arrowDirection * 10, currentColor)
          }
        }
      }

      ctx.restore()
    })
  }

  // Draw compasses
  const drawCompasses = (ctx) => {
    compasses.forEach((compass) => {
      ctx.save()

      // Translate to compass position
      ctx.translate(compass.x, compass.y)

      // Draw compass circle
      ctx.beginPath()
      ctx.arc(0, 0, compass.radius, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
      ctx.fill()
      ctx.strokeStyle = "#71717a"
      ctx.lineWidth = 1
      ctx.stroke()

      // Draw needle
      if (compass.angle !== undefined) {
        ctx.rotate((compass.angle * Math.PI) / 180)

        // North (red)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(compass.radius, 0)
        ctx.strokeStyle = "#ef4444"
        ctx.lineWidth = 2
        ctx.stroke()

        // South (blue)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(-compass.radius, 0)
        ctx.strokeStyle = "#3b82f6"
        ctx.lineWidth = 2
        ctx.stroke()
      }

      ctx.restore()
    })
  }

  // Helper function to draw arrows
  const drawArrow = (ctx, x, y, dx, dy, color) => {
    const headLength = 5
    const headAngle = Math.PI / 6

    // Calculate arrow head points
    const angle = Math.atan2(dy, dx)

    ctx.save()
    ctx.fillStyle = color
    ctx.strokeStyle = color
    ctx.lineWidth = 2

    // Draw arrow line
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + dx, y + dy)
    ctx.stroke()

    // Draw arrow head
    ctx.beginPath()
    ctx.moveTo(x + dx, y + dy)
    ctx.lineTo(x + dx - headLength * Math.cos(angle - headAngle), y + dy - headLength * Math.sin(angle - headAngle))
    ctx.lineTo(x + dx - headLength * Math.cos(angle + headAngle), y + dy - headLength * Math.sin(angle + headAngle))
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  }

  // Handle mouse down on canvas
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicked on a magnet
    for (let i = magnets.length - 1; i >= 0; i--) {
      const magnet = magnets[i]

      // Check if point is within magnet bounds (accounting for rotation)
      if (isPointInRotatedRect(x, y, magnet)) {
        setActiveDrag({ type: "magnet", index: i, offsetX: x - magnet.x, offsetY: y - magnet.y })
        return
      }
    }

    // Check if clicked on an electromagnet
    for (let i = electromagnets.length - 1; i >= 0; i--) {
      const em = electromagnets[i]
      const dx = x - em.x
      const dy = y - em.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance <= em.radius) {
        setActiveDrag({ type: "electromagnet", index: i, offsetX: x - em.x, offsetY: y - em.y })
        return
      }
    }

    // Check if clicked on a compass
    for (let i = compasses.length - 1; i >= 0; i--) {
      const compass = compasses[i]
      const dx = x - compass.x
      const dy = y - compass.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance <= compass.radius) {
        setActiveDrag({ type: "compass", index: i, offsetX: x - compass.x, offsetY: y - compass.y })
        return
      }
    }
  }

  // Helper function to check if a point is within a rotated rectangle
  const isPointInRotatedRect = (x, y, rect) => {
    // Translate point to origin
    const dx = x - rect.x
    const dy = y - rect.y

    // Rotate point in opposite direction of rectangle
    const rotationRad = (-rect.rotation * Math.PI) / 180
    const rotatedX = dx * Math.cos(rotationRad) - dy * Math.sin(rotationRad)
    const rotatedY = dx * Math.sin(rotationRad) + dy * Math.cos(rotationRad)

    // Check if rotated point is within rectangle bounds
    return Math.abs(rotatedX) <= rect.width / 2 && Math.abs(rotatedY) <= rect.height / 2
  }

  // Handle mouse move on canvas
  const handleMouseMove = (e) => {
    if (!activeDrag) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (activeDrag.type === "magnet") {
      const newMagnets = [...magnets]
      newMagnets[activeDrag.index] = {
        ...newMagnets[activeDrag.index],
        x: x - activeDrag.offsetX,
        y: y - activeDrag.offsetY,
      }
      setMagnets(newMagnets)
    } else if (activeDrag.type === "electromagnet") {
      const newElectromagnets = [...electromagnets]
      newElectromagnets[activeDrag.index] = {
        ...newElectromagnets[activeDrag.index],
        x: x - activeDrag.offsetX,
        y: y - activeDrag.offsetY,
      }
      setElectromagnets(newElectromagnets)
    } else if (activeDrag.type === "compass") {
      const newCompasses = [...compasses]
      newCompasses[activeDrag.index] = {
        ...newCompasses[activeDrag.index],
        x: x - activeDrag.offsetX,
        y: y - activeDrag.offsetY,
      }
      setCompasses(newCompasses)
    }
  }

  // Handle mouse up
  const handleMouseUp = () => {
    setActiveDrag(null)
  }

  // Handle key down for rotation
  const handleKeyDown = (e) => {
    if (!activeDrag) return

    // Rotate with R and T keys
    if (e.key === "r" || e.key === "t") {
      const rotationDelta = e.key === "r" ? -5 : 5

      if (activeDrag.type === "magnet") {
        const newMagnets = [...magnets]
        newMagnets[activeDrag.index] = {
          ...newMagnets[activeDrag.index],
          rotation: (newMagnets[activeDrag.index].rotation + rotationDelta) % 360,
        }
        setMagnets(newMagnets)
      } else if (activeDrag.type === "electromagnet") {
        const newElectromagnets = [...electromagnets]
        newElectromagnets[activeDrag.index] = {
          ...newElectromagnets[activeDrag.index],
          rotation: (newElectromagnets[activeDrag.index].rotation + rotationDelta) % 360,
        }
        setElectromagnets(newElectromagnets)
      }
    }
  }

  // Add a new bar magnet
  const addBarMagnet = () => {
    const newMagnet = {
      id: Date.now(),
      type: "bar",
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      rotation: 0,
      strength: 100,
      width: 100,
      height: 30,
    }

    setMagnets([...magnets, newMagnet])
  }

  // Add a new electromagnet
  const addElectromagnet = () => {
    const newElectromagnet = {
      id: Date.now(),
      type: "solenoid",
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      rotation: 0,
      current: 50,
      on: true,
      radius: 40,
    }

    setElectromagnets([...electromagnets, newElectromagnet])
  }

  // Add a new compass
  const addCompass = () => {
    const newCompass = {
      id: Date.now(),
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      radius: 15,
    }

    setCompasses([...compasses, newCompass])
  }

  // Toggle electromagnet on/off
  const toggleElectromagnet = (index) => {
    const newElectromagnets = [...electromagnets]
    newElectromagnets[index] = {
      ...newElectromagnets[index],
      on: !newElectromagnets[index].on,
    }
    setElectromagnets(newElectromagnets)
  }

  // Change electromagnet current
  const changeElectromagnetCurrent = (index, value) => {
    const newElectromagnets = [...electromagnets]
    newElectromagnets[index] = {
      ...newElectromagnets[index],
      current: value,
    }
    setElectromagnets(newElectromagnets)
  }

  // Change magnet strength
  const changeMagnetStrength = (index, value) => {
    const newMagnets = [...magnets]
    newMagnets[index] = {
      ...newMagnets[index],
      strength: value,
    }
    setMagnets(newMagnets)
  }

  // Reset simulation
  const resetSimulation = () => {
    setMagnets([{ id: 1, type: "bar", x: 200, y: 200, rotation: 0, strength: 100, width: 100, height: 30 }])

    setElectromagnets([{ id: 1, type: "solenoid", x: 400, y: 200, rotation: 0, current: 50, on: true, radius: 40 }])

    setCompasses([
      { id: 1, x: 300, y: 300, radius: 15 },
      { id: 2, x: 500, y: 300, radius: 15 },
      { id: 3, x: 300, y: 400, radius: 15 },
      { id: 4, x: 500, y: 400, radius: 15 },
    ])

    initializeParticles()
  }

  // Initialize compassesRef when compasses state changes
  useEffect(() => {
    compassesRef.current = compasses
  }, [compasses])

  return (
    <div className="flex flex-col w-full h-full bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
      <div className="p-4 bg-gray-100 dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Magnetic Fields Simulator</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Drag magnets and electromagnets to see how magnetic fields interact. Use R and T keys to rotate selected
          objects.
        </p>

        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={addBarMagnet}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Add Bar Magnet
          </button>
          <button
            onClick={addElectromagnet}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Add Electromagnet
          </button>
          <button
            onClick={addCompass}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
          >
            Add Compass
          </button>
          <button
            onClick={resetSimulation}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            Reset Simulation
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showFieldLines"
              checked={showFieldLines}
              onChange={() => setShowFieldLines(!showFieldLines)}
              className="mr-2"
            />
            <label htmlFor="showFieldLines" className="text-gray-700 dark:text-gray-300">
              Show Field Lines
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showPoleMarkers"
              checked={showPoleMarkers}
              onChange={() => setShowPoleMarkers(!showPoleMarkers)}
              className="mr-2"
            />
            <label htmlFor="showPoleMarkers" className="text-gray-700 dark:text-gray-300">
              Show Pole Markers
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showHeatmap"
              checked={showHeatmap}
              onChange={() => setShowHeatmap(!showHeatmap)}
              className="mr-2"
            />
            <label htmlFor="showHeatmap" className="text-gray-700 dark:text-gray-300">
              Show Field Heatmap
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showCompasses"
              checked={showCompasses}
              onChange={() => setShowCompasses(!showCompasses)}
              className="mr-2"
            />
            <label htmlFor="showCompasses" className="text-gray-700 dark:text-gray-300">
              Show Compasses
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showGrid"
              checked={showGrid}
              onChange={() => setShowGrid(!showGrid)}
              className="mr-2"
            />
            <label htmlFor="showGrid" className="text-gray-700 dark:text-gray-300">
              Show Grid
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative" ref={containerRef}>
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full cursor-grab"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            tabIndex={0}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="w-80 bg-gray-100 dark:bg-gray-800 p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Controls</h3>

          <div className="mb-6">
            <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Field Visualization</h4>
            <SliderRow
              label="Particle Count"
              value={particleCount}
              min={50}
              max={500}
              step={10}
              onChange={setParticleCount}
            />
            <SliderRow
              label="Particle Speed"
              value={particleSpeed}
              min={0.1}
              max={3}
              step={0.1}
              onChange={setParticleSpeed}
            />
            <SliderRow
              label="Field Density"
              value={fieldDensity}
              min={5}
              max={50}
              step={1}
              onChange={setFieldDensity}
            />
          </div>

          {magnets.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Bar Magnets</h4>
              {magnets.map((magnet, index) => (
                <div key={magnet.id} className="mb-4 p-3 bg-white dark:bg-gray-700 rounded">
                  <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Magnet #{index + 1}</p>
                  <SliderRow
                    label="Strength"
                    value={magnet.strength}
                    min={10}
                    max={200}
                    step={1}
                    onChange={(value) => changeMagnetStrength(index, value)}
                  />
                </div>
              ))}
            </div>
          )}

          {electromagnets.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Electromagnets</h4>
              {electromagnets.map((em, index) => (
                <div key={em.id} className="mb-4 p-3 bg-white dark:bg-gray-700 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Electromagnet #{index + 1}</p>
                    <label className="inline-flex items-center cursor-pointer">
                      <span className="mr-2 text-sm text-gray-700 dark:text-gray-300">{em.on ? "ON" : "OFF"}</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={em.on}
                          onChange={() => toggleElectromagnet(index)}
                        />
                        <div
                          className={`w-10 h-5 rounded-full transition ${em.on ? "bg-green-500" : "bg-gray-400"}`}
                        ></div>
                        <div
                          className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                            em.on ? "transform translate-x-5" : ""
                          }`}
                        ></div>
                      </div>
                    </label>
                  </div>
                  <SliderRow
                    label="Current"
                    value={em.current}
                    min={-100}
                    max={100}
                    step={1}
                    onChange={(value) => changeElectromagnetCurrent(index, value)}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="p-3 bg-white dark:bg-gray-700 rounded mb-4">
            <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Instructions</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Drag objects to move them</li>
              <li>• Use R/T keys to rotate magnets</li>
              <li>• Add new objects with buttons</li>
              <li>• Watch compasses align with field</li>
              <li>• Adjust current to change field</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
