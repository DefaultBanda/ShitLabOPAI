"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

export default function FlappyBird() {
  const canvasRef = useRef(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [character, setCharacter] = useState("classic")
  const [theme, setTheme] = useState("day")
  const [difficulty, setDifficulty] = useState("normal")

  // Game state refs (don't trigger re-renders)
  const gameStateRef = useRef({
    bird: {
      x: 50,
      y: 200,
      width: 34,
      height: 24,
      velocity: 0,
      gravity: 0.5,
      flapPower: -8,
      rotation: 0,
    },
    pipes: [],
    powerUps: [],
    frameCount: 0,
    pipeSpawnInterval: 100,
    pipeGapSize: 150,
    pipeWidth: 52,
    gameSpeed: 2,
    playing: false,
    score: 0,
    passedPipes: new Set(),
    lastTimestamp: 0,
    deltaTime: 0,
    effects: [],
  })

  const characterColors = {
    classic: "#FFFF00",
    blue: "#3498db",
    red: "#e74c3c",
    green: "#2ecc71",
    purple: "#9b59b6",
  }

  const difficultySettings = {
    easy: { gravity: 0.4, pipeGapSize: 180, gameSpeed: 1.5 },
    normal: { gravity: 0.5, pipeGapSize: 150, gameSpeed: 2 },
    hard: { gravity: 0.6, pipeGapSize: 130, gameSpeed: 2.5 },
    insane: { gravity: 0.7, pipeGapSize: 120, gameSpeed: 3 },
  }

  // Initialize game
  useEffect(() => {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem("flappyBirdHighScore")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore))
    }

    // Apply difficulty settings
    const settings = difficultySettings[difficulty]
    gameStateRef.current.bird.gravity = settings.gravity
    gameStateRef.current.pipeGapSize = settings.pipeGapSize
    gameStateRef.current.gameSpeed = settings.gameSpeed

    // Set up canvas
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")

    // Handle window resize
    const handleResize = () => {
      canvas.width = Math.min(450, window.innerWidth - 40)
      canvas.height = 600
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    // Initial render
    drawGame(ctx)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [difficulty])

  // Game loop
  useEffect(() => {
    if (!gameStarted) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    let animationFrameId

    const gameLoop = (timestamp) => {
      // Calculate delta time for smooth animation
      if (!gameStateRef.current.lastTimestamp) {
        gameStateRef.current.lastTimestamp = timestamp
      }

      gameStateRef.current.deltaTime = (timestamp - gameStateRef.current.lastTimestamp) / 16.67 // normalize to ~60fps
      gameStateRef.current.lastTimestamp = timestamp

      if (!gameOver && gameStateRef.current.playing) {
        updateGame()
      }

      drawGame(ctx)
      animationFrameId = requestAnimationFrame(gameLoop)
    }

    gameStateRef.current.playing = true
    animationFrameId = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [gameStarted, gameOver])

  // Handle key and touch events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.code === "Space" || e.key === " " || e.key === "ArrowUp") && !gameOver) {
        flap()
        if (!gameStarted) {
          setGameStarted(true)
        }
      }

      // Restart game on R key
      if (e.key === "r" && gameOver) {
        restartGame()
      }
    }

    const handleTouchStart = () => {
      if (!gameOver) {
        flap()
        if (!gameStarted) {
          setGameStarted(true)
        }
      } else {
        restartGame()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    canvasRef.current?.addEventListener("touchstart", handleTouchStart)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      canvasRef.current?.removeEventListener("touchstart", handleTouchStart)
    }
  }, [gameStarted, gameOver])

  // Flap function
  const flap = () => {
    if (gameOver) return

    gameStateRef.current.bird.velocity = gameStateRef.current.bird.flapPower
    gameStateRef.current.bird.rotation = -20

    // Add flap effect
    gameStateRef.current.effects.push({
      type: "circle",
      x: gameStateRef.current.bird.x - 10,
      y: gameStateRef.current.bird.y + 10,
      radius: 10,
      opacity: 1,
      color: "rgba(255, 255, 255, 0.7)",
    })

    // Play flap sound
    playSound("flap")
  }

  // Play sound effect
  const playSound = (sound) => {
    // Simple sound implementation
    const sounds = {
      flap: { frequency: 600, duration: 100 },
      score: { frequency: 800, duration: 100 },
      hit: { frequency: 300, duration: 300 },
      powerup: { frequency: 1200, duration: 150 },
    }

    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = sound === "hit" ? "sawtooth" : "sine"
      oscillator.frequency.value = sounds[sound].frequency
      gainNode.gain.value = 0.1

      oscillator.start()

      // Fade out
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + sounds[sound].duration / 1000)
      oscillator.stop(ctx.currentTime + sounds[sound].duration / 1000)
    } catch (e) {
      console.log("Audio not supported")
    }
  }

  // Update game state
  const updateGame = () => {
    const state = gameStateRef.current
    const dt = state.deltaTime || 1

    // Update bird
    state.bird.velocity += state.bird.gravity * dt
    state.bird.y += state.bird.velocity * dt

    // Gradually rotate bird based on velocity
    if (state.bird.velocity > 0) {
      state.bird.rotation = Math.min(90, state.bird.rotation + 3 * dt)
    }

    // Update pipes
    state.frameCount += dt

    // Spawn new pipes
    if (state.frameCount >= state.pipeSpawnInterval) {
      const minHeight = 50
      const maxHeight = canvasRef.current.height - state.pipeGapSize - minHeight
      const height = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight)

      state.pipes.push({
        x: canvasRef.current.width,
        topHeight: height,
        bottomY: height + state.pipeGapSize,
        width: state.pipeWidth,
        passed: false,
        hasPowerUp: Math.random() < 0.2, // 20% chance of power-up
      })

      state.frameCount = 0
    }

    // Move pipes
    for (let i = 0; i < state.pipes.length; i++) {
      state.pipes[i].x -= state.gameSpeed * dt

      // Check if bird passed pipe
      if (!state.pipes[i].passed && state.pipes[i].x + state.pipes[i].width < state.bird.x) {
        state.pipes[i].passed = true
        state.score += 1
        setScore(state.score)

        // Add score effect
        state.effects.push({
          type: "text",
          text: "+1",
          x: state.bird.x + 20,
          y: 50,
          opacity: 1,
          velocity: -1,
        })

        playSound("score")

        // Spawn power-up
        if (state.pipes[i].hasPowerUp) {
          state.powerUps.push({
            x: state.pipes[i].x + state.pipes[i].width / 2,
            y: state.pipes[i].topHeight + state.pipeGapSize / 2,
            width: 20,
            height: 20,
            type: Math.random() < 0.5 ? "shield" : "slowmo",
            active: false,
            collected: false,
          })
        }
      }

      // Check collision with pipes
      if (
        checkCollision(state.bird, {
          x: state.pipes[i].x,
          y: 0,
          width: state.pipes[i].width,
          height: state.pipes[i].topHeight,
        }) ||
        checkCollision(state.bird, {
          x: state.pipes[i].x,
          y: state.pipes[i].bottomY,
          width: state.pipes[i].width,
          height: canvasRef.current.height - state.pipes[i].bottomY,
        })
      ) {
        handleGameOver()
      }
    }

    // Remove off-screen pipes
    state.pipes = state.pipes.filter((pipe) => pipe.x + pipe.width > 0)

    // Update power-ups
    for (let i = 0; i < state.powerUps.length; i++) {
      const powerUp = state.powerUps[i]
      powerUp.x -= state.gameSpeed * dt

      // Check collision with power-up
      if (!powerUp.collected && checkCollision(state.bird, powerUp)) {
        powerUp.collected = true
        activatePowerUp(powerUp.type)
        playSound("powerup")
      }
    }

    // Remove off-screen power-ups
    state.powerUps = state.powerUps.filter((powerUp) => powerUp.x + powerUp.width > 0 && !powerUp.collected)

    // Update effects
    for (let i = 0; i < state.effects.length; i++) {
      const effect = state.effects[i]
      effect.opacity -= 0.02 * dt

      if (effect.type === "text") {
        effect.y += effect.velocity * dt
      } else if (effect.type === "circle") {
        effect.radius += 1 * dt
      }
    }

    // Remove faded effects
    state.effects = state.effects.filter((effect) => effect.opacity > 0)

    // Check if bird hit ground or ceiling
    if (state.bird.y + state.bird.height > canvasRef.current.height || state.bird.y < 0) {
      handleGameOver()
    }
  }

  // Activate power-up
  const activatePowerUp = (type) => {
    const state = gameStateRef.current

    // Add power-up effect
    state.effects.push({
      type: "text",
      text: type === "shield" ? "SHIELD!" : "SLOW-MO!",
      x: state.bird.x,
      y: state.bird.y - 20,
      opacity: 1,
      velocity: -1.5,
    })

    if (type === "shield") {
      // Shield protects from next hit
      state.bird.hasShield = true
    } else if (type === "slowmo") {
      // Slow down game speed temporarily
      const originalSpeed = state.gameSpeed
      state.gameSpeed = state.gameSpeed / 2

      setTimeout(() => {
        state.gameSpeed = originalSpeed
      }, 5000)
    }
  }

  // Check collision between two objects
  const checkCollision = (obj1, obj2) => {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    )
  }

  // Handle game over
  const handleGameOver = () => {
    const state = gameStateRef.current

    // Check if bird has shield
    if (state.bird.hasShield) {
      state.bird.hasShield = false

      // Add shield break effect
      state.effects.push({
        type: "circle",
        x: state.bird.x,
        y: state.bird.y,
        radius: 20,
        opacity: 1,
        color: "rgba(0, 150, 255, 0.7)",
      })

      return
    }

    if (!gameOver) {
      setGameOver(true)
      gameStateRef.current.playing = false

      // Update high score
      if (state.score > highScore) {
        setHighScore(state.score)
        localStorage.setItem("flappyBirdHighScore", state.score.toString())
      }

      playSound("hit")
    }
  }

  // Restart game
  const restartGame = () => {
    const settings = difficultySettings[difficulty]

    gameStateRef.current = {
      bird: {
        x: 50,
        y: 200,
        width: 34,
        height: 24,
        velocity: 0,
        gravity: settings.gravity,
        flapPower: -8,
        rotation: 0,
      },
      pipes: [],
      powerUps: [],
      frameCount: 0,
      pipeSpawnInterval: 100,
      pipeGapSize: settings.pipeGapSize,
      pipeWidth: 52,
      gameSpeed: settings.gameSpeed,
      playing: true,
      score: 0,
      passedPipes: new Set(),
      lastTimestamp: 0,
      deltaTime: 0,
      effects: [],
    }

    setScore(0)
    setGameOver(false)
    setGameStarted(true)
  }

  // Draw game
  const drawGame = (ctx) => {
    if (!ctx) return

    const state = gameStateRef.current
    const canvas = canvasRef.current

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background
    const bgColor = theme === "day" ? "#87CEEB" : "#0C1445"
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw clouds in day theme
    if (theme === "day") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
      ctx.beginPath()
      ctx.arc(100, 80, 30, 0, Math.PI * 2)
      ctx.arc(130, 70, 40, 0, Math.PI * 2)
      ctx.arc(160, 80, 30, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.arc(320, 120, 25, 0, Math.PI * 2)
      ctx.arc(350, 110, 35, 0, Math.PI * 2)
      ctx.arc(380, 120, 25, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw stars in night theme
    if (theme === "night") {
      ctx.fillStyle = "white"
      for (let i = 0; i < 50; i++) {
        const x = (i * 17) % canvas.width
        const y = ((i * 23) % (canvas.height - 100)) + 10
        const size = (i % 3) + 1
        ctx.fillRect(x, y, size, size)
      }
    }

    // Draw pipes
    for (const pipe of state.pipes) {
      // Top pipe
      const pipeColor = theme === "day" ? "#4CAF50" : "#2E7D32"
      ctx.fillStyle = pipeColor
      ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight)

      // Pipe cap
      ctx.fillStyle = theme === "day" ? "#388E3C" : "#1B5E20"
      ctx.fillRect(pipe.x - 3, pipe.topHeight - 10, pipe.width + 6, 10)

      // Bottom pipe
      ctx.fillStyle = pipeColor
      ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, canvas.height - pipe.bottomY)

      // Pipe cap
      ctx.fillStyle = theme === "day" ? "#388E3C" : "#1B5E20"
      ctx.fillRect(pipe.x - 3, pipe.bottomY, pipe.width + 6, 10)
    }

    // Draw power-ups
    for (const powerUp of state.powerUps) {
      if (!powerUp.collected) {
        ctx.save()
        ctx.translate(powerUp.x, powerUp.y)
        ctx.rotate(state.frameCount / 10)

        if (powerUp.type === "shield") {
          // Draw shield power-up
          ctx.fillStyle = "#3498db"
          ctx.beginPath()
          ctx.arc(0, 0, 10, 0, Math.PI * 2)
          ctx.fill()

          ctx.strokeStyle = "white"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(0, 0, 6, 0, Math.PI * 2)
          ctx.stroke()
        } else {
          // Draw slow-mo power-up
          ctx.fillStyle = "#9b59b6"
          ctx.beginPath()
          ctx.arc(0, 0, 10, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = "white"
          ctx.beginPath()
          ctx.moveTo(-5, -3)
          ctx.lineTo(5, 0)
          ctx.lineTo(-5, 3)
          ctx.closePath()
          ctx.fill()
        }

        ctx.restore()
      }
    }

    // Draw bird
    ctx.save()
    ctx.translate(state.bird.x + state.bird.width / 2, state.bird.y + state.bird.height / 2)
    ctx.rotate((state.bird.rotation * Math.PI) / 180)

    // Bird body
    ctx.fillStyle = characterColors[character]
    ctx.beginPath()
    ctx.ellipse(0, 0, state.bird.width / 2, state.bird.height / 2, 0, 0, Math.PI * 2)
    ctx.fill()

    // Bird eye
    ctx.fillStyle = "white"
    ctx.beginPath()
    ctx.arc(10, -5, 5, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "black"
    ctx.beginPath()
    ctx.arc(12, -5, 2, 0, Math.PI * 2)
    ctx.fill()

    // Bird beak
    ctx.fillStyle = "#FF9800"
    ctx.beginPath()
    ctx.moveTo(15, 0)
    ctx.lineTo(25, -3)
    ctx.lineTo(25, 3)
    ctx.closePath()
    ctx.fill()

    // Bird wing
    const wingOffset = Math.sin(Date.now() / 100) * 3
    ctx.fillStyle = theme === "day" ? "#FFC107" : "#FFA000"
    ctx.beginPath()
    ctx.ellipse(-5, wingOffset + 5, 8, 5, Math.PI / 4, 0, Math.PI * 2)
    ctx.fill()

    // Shield effect if active
    if (state.bird.hasShield) {
      ctx.strokeStyle = "rgba(0, 150, 255, 0.7)"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(0, 0, state.bird.width / 2 + 5, 0, Math.PI * 2)
      ctx.stroke()
    }

    ctx.restore()

    // Draw ground
    const groundColor = theme === "day" ? "#8B4513" : "#3E2723"
    ctx.fillStyle = groundColor
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20)

    // Draw grass
    const grassColor = theme === "day" ? "#4CAF50" : "#2E7D32"
    ctx.fillStyle = grassColor
    ctx.fillRect(0, canvas.height - 20, canvas.width, 5)

    // Draw effects
    for (const effect of state.effects) {
      ctx.globalAlpha = effect.opacity

      if (effect.type === "circle") {
        ctx.strokeStyle = effect.color || "white"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2)
        ctx.stroke()
      } else if (effect.type === "text") {
        ctx.fillStyle = "white"
        ctx.font = "bold 20px Arial"
        ctx.textAlign = "center"
        ctx.fillText(effect.text, effect.x, effect.y)
      }

      ctx.globalAlpha = 1
    }

    // Draw score
    ctx.fillStyle = "white"
    ctx.font = "bold 30px Arial"
    ctx.textAlign = "center"
    ctx.fillText(score.toString(), canvas.width / 2, 50)

    // Draw game over screen
    if (gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "white"
      ctx.font = "bold 40px Arial"
      ctx.textAlign = "center"
      ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 50)

      ctx.font = "bold 30px Arial"
      ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2)
      ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 40)

      ctx.font = "20px Arial"
      ctx.fillText("Press R or Tap to Restart", canvas.width / 2, canvas.height / 2 + 90)
    }

    // Draw start screen
    if (!gameStarted) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "white"
      ctx.font = "bold 40px Arial"
      ctx.textAlign = "center"
      ctx.fillText("Flappy Bird", canvas.width / 2, canvas.height / 2 - 50)

      ctx.font = "20px Arial"
      ctx.fillText("Press Space or Tap to Start", canvas.width / 2, canvas.height / 2 + 20)

      ctx.font = "16px Arial"
      ctx.fillText("Collect power-ups for special abilities!", canvas.width / 2, canvas.height / 2 + 60)
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Sick Flappy Bird</h1>

      <div className="relative mb-4">
        <canvas
          ref={canvasRef}
          className="border-4 border-gray-800 rounded-lg shadow-lg bg-blue-200 dark:bg-blue-900"
          width={450}
          height={600}
        />

        {!gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", duration: 0.5 }}
              className="text-white text-xl font-bold"
            >
              Tap to Start
            </motion.div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-4">
        <div className="flex flex-col items-center">
          <label className="text-sm mb-1">Character</label>
          <div className="flex gap-2">
            {Object.keys(characterColors).map((char) => (
              <button
                key={char}
                className={`w-8 h-8 rounded-full ${character === char ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
                style={{ backgroundColor: characterColors[char] }}
                onClick={() => setCharacter(char)}
                disabled={gameStarted && !gameOver}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <label className="text-sm mb-1">Theme</label>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded ${theme === "day" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
              onClick={() => setTheme("day")}
              disabled={gameStarted && !gameOver}
            >
              Day
            </button>
            <button
              className={`px-3 py-1 rounded ${theme === "night" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
              onClick={() => setTheme("night")}
              disabled={gameStarted && !gameOver}
            >
              Night
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <label className="text-sm mb-1">Difficulty</label>
          <select
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            disabled={gameStarted && !gameOver}
          >
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
            <option value="insane">Insane</option>
          </select>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm mb-2">
          <strong>Controls:</strong> Space/Up Arrow/Tap to flap, R to restart
        </p>
        <p className="text-sm">
          <strong>Power-ups:</strong> Blue = Shield, Purple = Slow-Mo
        </p>
      </div>
    </div>
  )
}
