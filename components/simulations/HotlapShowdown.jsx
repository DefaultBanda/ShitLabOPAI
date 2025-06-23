"use client"

import { useEffect, useRef, useState } from "react"
import { getTopScores, saveLapTime } from "@/utils/supabase-hotlap"
import { useTheme } from "next-themes"
import html2canvas from "html2canvas"

// F1 2024 Calendar Tracks with natural curves
const F1_TRACKS = [
  { id: "bahrain", name: "Bahrain International Circuit" },
  { id: "jeddah", name: "Street of Saudia" },
  { id: "melbourne", name: "Albert Park" },
  { id: "suzuka", name: "Suzuka Circuit" },
  { id: "shanghai", name: "Shanghai International Circuit" },
  { id: "miami", name: "Miami International Autodrome" },
  { id: "imola", name: "Autodromo Enzo e Dino Ferrari" },
  { id: "monaco", name: "Circuit de Monaco" },
  { id: "montreal", name: "Circuit Gilles Villeneuve" },
  { id: "barcelona", name: "Circuit de Barcelona-Catalunya" },
  { id: "spielberg", name: "Red Bull Ring" },
  { id: "silverstone", name: "Silverstone Circuit" },
  { id: "budapest", name: "Hungaroring" },
  { id: "spa", name: "Circuit de Spa-Francorchamps" },
  { id: "zandvoort", name: "Circuit Zandvoort" },
  { id: "monza", name: "Autodromo Nazionale Monza" },
  { id: "baku", name: "Baku City Circuit" },
  { id: "singapore", name: "Marina Bay Street Circuit" },
  { id: "austin", name: "Circuit of the Americas" },
  { id: "mexico", name: "Autódromo Hermanos Rodríguez" },
  { id: "saopaulo", name: "Autódromo José Carlos Pace" },
  { id: "lasvegas", name: "Las Vegas Strip Circuit" },
  { id: "losail", name: "Losail International Circuit" },
  { id: "abudhabi", name: "Yas Marina Circuit" },
]

// Meme Constructor Teams with image paths
const CONSTRUCTORS = [
  { id: "redbull", name: "Franz Hermann Racing", color: "#0600EF", image: "/images/constructors/franz-hermann.png" },
  { id: "ferrari", name: "Scuderia Overcut", color: "#DC0000", image: "/images/constructors/prancing-meteor.png" },
  { id: "mercedes", name: "No Mikey No", color: "#00D2BE", image: "/images/constructors/silver-hawkworks.png" },
  { id: "mclaren", name: "Oscar’s Kitchen", color: "#FF8700", image: "/images/constructors/papaya-blaze.png" },
  {
    id: "astonmartin",
    name: "Daddy's Tax Write-Off",
    color: "#006F62",
    image: "/images/constructors/team-strollspeed.png",
  },
  { id: "alpine", name: "Baguette", color: "#0090FF", image: "/images/constructors/bleu-de-france.png" },
  { id: "rb", name: "Visa Declined", color: "#1E41FF", image: "/images/constructors/alpha-howlers.png" },
  { id: "williams", name: "Vowels Inc", color: "#005AFF", image: "/images/constructors/vantavision.png" },
  { id: "sauber", name: "Sauber Sigma", color: "#900000", image: "/images/constructors/sauber-sigma.png" },
  { id: "haas", name: "Steiner Sons", color: "#B9B9B7", image: "/images/constructors/steiner-sons.png" },
]

// Team color schemes for custom pixel car drawing
const TEAM_COLORS = {
  "Franz Hermann Racing": { body: "#0033cc", accent: "#ff0000" },
  "Scuderia Overcut": { body: "#cc0000", accent: "#ffffff" },
  "No Mikey No": { body: "#aaaaaa", accent: "#000000" },
  "Oscar’s Kitchen": { body: "#ff8000", accent: "#ffffff" },
  "Daddy's Tax Write-Off": { body: "#006644", accent: "#99ffcc" },
  Baguette: { body: "#0055ff", accent: "#ffffff" },
  "Visa Declined": { body: "#222222", accent: "#4444ff" },
  "Vowels Inc": { body: "#003366", accent: "#6699cc" },
  "Sauber Sigma": { body: "#00ffcc", accent: "#333333" },
  "Steiner Sons": { body: "#222222", accent: "#ffffff" },
}

// Track layouts with natural curves and wider tracks
const TRACK_LAYOUTS = {
  bahrain: {
    path: [
      { x: 150, y: 150, type: "start" },
      { x: 250, y: 150, type: "straight" },
      { x: 350, y: 180, type: "curve" },
      { x: 450, y: 250, type: "curve" },
      { x: 500, y: 350, type: "curve" },
      { x: 450, y: 450, type: "curve" },
      { x: 350, y: 500, type: "curve" },
      { x: 250, y: 480, type: "curve" },
      { x: 150, y: 450, type: "curve" },
      { x: 100, y: 350, type: "curve" },
      { x: 120, y: 250, type: "curve" },
      { x: 150, y: 150, type: "finish" },
    ],
    width: 60,
    arrows: [
      { x: 200, y: 150 },
      { x: 300, y: 165 },
      { x: 400, y: 215 },
      { x: 475, y: 300 },
      { x: 475, y: 400 },
      { x: 400, y: 475 },
      { x: 300, y: 490 },
      { x: 200, y: 465 },
      { x: 125, y: 400 },
      { x: 110, y: 300 },
    ],
    startPosition: { x: 150, y: 150 },
  },
  jeddah: {
    path: [
      { x: 150, y: 150, type: "start" },
      { x: 300, y: 150, type: "straight" },
      { x: 450, y: 180, type: "curve" },
      { x: 500, y: 280, type: "curve" },
      { x: 480, y: 380, type: "curve" },
      { x: 400, y: 450, type: "curve" },
      { x: 300, y: 480, type: "curve" },
      { x: 200, y: 450, type: "curve" },
      { x: 120, y: 380, type: "curve" },
      { x: 100, y: 280, type: "curve" },
      { x: 120, y: 200, type: "curve" },
      { x: 150, y: 150, type: "finish" },
    ],
    width: 60,
    arrows: [
      { x: 225, y: 150 },
      { x: 375, y: 165 },
      { x: 475, y: 230 },
      { x: 490, y: 330 },
      { x: 440, y: 415 },
      { x: 350, y: 465 },
      { x: 250, y: 465 },
      { x: 160, y: 415 },
      { x: 110, y: 330 },
      { x: 110, y: 225 },
    ],
    startPosition: { x: 150, y: 150 },
  },
  suzuka: {
    path: [
      { x: 150, y: 200, type: "start" },
      { x: 250, y: 180, type: "curve" },
      { x: 350, y: 200, type: "curve" },
      { x: 420, y: 280, type: "curve" },
      { x: 450, y: 380, type: "curve" },
      { x: 400, y: 450, type: "curve" },
      { x: 300, y: 480, type: "curve" },
      { x: 200, y: 460, type: "curve" },
      { x: 120, y: 400, type: "curve" },
      { x: 100, y: 320, type: "curve" },
      { x: 130, y: 240, type: "curve" },
      { x: 150, y: 200, type: "finish" },
    ],
    width: 65,
    arrows: [
      { x: 200, y: 190 },
      { x: 300, y: 190 },
      { x: 385, y: 240 },
      { x: 435, y: 330 },
      { x: 425, y: 415 },
      { x: 350, y: 470 },
      { x: 250, y: 470 },
      { x: 160, y: 430 },
      { x: 110, y: 360 },
      { x: 115, y: 280 },
    ],
    startPosition: { x: 150, y: 200 },
  },

  melbourne: {
    path: [
      { x: 360, y: 490, type: "start" },
      { x: 310, y: 440, type: "curve" },
      { x: 350, y: 450, type: "curve" },
      { x: 330, y: 450, type: "curve" },
      { x: 370, y: 510, type: "curve" },
      { x: 370, y: 460, type: "curve" },
      { x: 390, y: 470, type: "curve" },
      { x: 370, y: 440, type: "curve" },
      { x: 450, y: 450, type: "curve" },
      { x: 410, y: 470, type: "curve" },
      { x: 390, y: 480, type: "curve" },
      { x: 400, y: 480, type: "curve" },
      { x: 410, y: 495, type: "curve" },
      { x: 395, y: 520, type: "curve" },
      { x: 380, y: 510, type: "curve" },
      { x: 350, y: 505, type: "curve" },
      { x: 365, y: 510, type: "curve" },
      { x: 380, y: 540, type: "curve" },
      { x: 420, y: 510, type: "curve" },
      { x: 420, y: 490, type: "curve" },
      { x: 420, y: 490, type: "curve" },
      { x: 430, y: 520, type: "curve" },
      { x: 400, y: 525, type: "curve" },
      { x: 385, y: 510, type: "curve" },
      { x: 375, y: 505, type: "curve" },
      { x: 360, y: 495, type: "curve" },
      { x: 360, y: 495, type: "curve" },
      { x: 330, y: 490, type: "curve" },
      { x: 345, y: 455, type: "curve" },
      { x: 360, y: 490, type: "curve" },
      { x: 320, y: 470, type: "curve" },
      { x: 360, y: 520, type: "finish" },
    ],
    width: 60,
    arrows: [
      { x: 335, y: 465 },
      { x: 345, y: 455 },
      { x: 370, y: 460 },
      { x: 390, y: 470 },
      { x: 400, y: 485 },
      { x: 410, y: 495 },
      { x: 395, y: 510 },
      { x: 370, y: 520 },
      { x: 360, y: 500 },
    ],
    startPosition: { x: 360, y: 490 },
  },
  monaco: {
    path: [
      { x: 80, y: 275, type: "start" },
      { x: 160, y: 200, type: "curve" },
      { x: 270, y: 170, type: "straight" },
      { x: 380, y: 190, type: "curve" },
      { x: 460, y: 260, type: "curve" },
      { x: 450, y: 355, type: "curve" },
      { x: 380, y: 430, type: "curve" },
      { x: 260, y: 455, type: "curve" },
      { x: 150, y: 415, type: "curve" },
      { x: 95, y: 330, type: "curve" },
      { x: 80, y: 275, type: "finish" },
    ],
    width: 55,
    arrows: [
      { x: 120, y: 235 },
      { x: 225, y: 180 },
      { x: 335, y: 185 },
      { x: 440, y: 235 },
      { x: 455, y: 315 },
      { x: 410, y: 400 },
      { x: 300, y: 445 },
      { x: 185, y: 425 },
      { x: 115, y: 345 },
    ],
    startPosition: { x: 80, y: 275 },
  },

  silverstone: {
    path: [
      { x: 90, y: 260, type: "start" },
      { x: 190, y: 190, type: "curve" },
      { x: 320, y: 170, type: "straight" },
      { x: 420, y: 210, type: "curve" },
      { x: 470, y: 300, type: "curve" },
      { x: 425, y: 380, type: "curve" },
      { x: 300, y: 430, type: "curve" },
      { x: 180, y: 430, type: "curve" },
      { x: 110, y: 350, type: "curve" },
      { x: 90, y: 260, type: "finish" },
    ],
    width: 60,
    arrows: [
      { x: 140, y: 215 },
      { x: 260, y: 175 },
      { x: 375, y: 195 },
      { x: 455, y: 265 },
      { x: 440, y: 350 },
      { x: 350, y: 415 },
      { x: 235, y: 430 },
      { x: 135, y: 360 },
    ],
    startPosition: { x: 90, y: 260 },
  },

  spa: {
    path: [
      { x: 140, y: 300, type: "start" },
      { x: 220, y: 210, type: "curve" },
      { x: 330, y: 170, type: "straight" },
      { x: 430, y: 190, type: "curve" },
      { x: 470, y: 280, type: "curve" },
      { x: 420, y: 370, type: "curve" },
      { x: 310, y: 430, type: "curve" },
      { x: 200, y: 410, type: "curve" },
      { x: 140, y: 340, type: "curve" },
      { x: 140, y: 300, type: "finish" },
    ],
    width: 65,
    arrows: [
      { x: 175, y: 255 },
      { x: 265, y: 195 },
      { x: 385, y: 195 },
      { x: 455, y: 240 },
      { x: 445, y: 330 },
      { x: 365, y: 410 },
      { x: 255, y: 430 },
      { x: 165, y: 360 },
    ],
    startPosition: { x: 140, y: 300 },
  },

  monza: {
    path: [
      { x: 120, y: 200, type: "start" },
      { x: 240, y: 170, type: "straight" },
      { x: 360, y: 170, type: "straight" },
      { x: 450, y: 240, type: "curve" },
      { x: 450, y: 360, type: "straight" },
      { x: 360, y: 430, type: "curve" },
      { x: 240, y: 430, type: "straight" },
      { x: 120, y: 400, type: "curve" },
      { x: 120, y: 200, type: "finish" },
    ],
    width: 60,
    arrows: [
      { x: 180, y: 180 },
      { x: 300, y: 170 },
      { x: 420, y: 200 },
      { x: 450, y: 300 },
      { x: 420, y: 400 },
      { x: 300, y: 430 },
      { x: 180, y: 410 },
      { x: 130, y: 305 },
    ],
    startPosition: { x: 120, y: 200 },
  },

  singapore: {
    path: [
      { x: 110, y: 250, type: "start" },
      { x: 210, y: 180, type: "curve" },
      { x: 330, y: 180, type: "straight" },
      { x: 440, y: 220, type: "curve" },
      { x: 470, y: 300, type: "curve" },
      { x: 430, y: 380, type: "curve" },
      { x: 320, y: 420, type: "curve" },
      { x: 200, y: 420, type: "straight" },
      { x: 120, y: 350, type: "curve" },
      { x: 110, y: 250, type: "finish" },
    ],
    width: 55,
    arrows: [
      { x: 150, y: 210 },
      { x: 270, y: 180 },
      { x: 380, y: 195 },
      { x: 455, y: 265 },
      { x: 435, y: 350 },
      { x: 335, y: 410 },
      { x: 225, y: 420 },
      { x: 145, y: 310 },
    ],
    startPosition: { x: 110, y: 250 },
  },

  redbullring: {
    path: [
      { x: 150, y: 330, type: "start" },
      { x: 200, y: 230, type: "curve" },
      { x: 320, y: 170, type: "straight" },
      { x: 420, y: 210, type: "curve" },
      { x: 470, y: 300, type: "curve" },
      { x: 430, y: 390, type: "curve" },
      { x: 310, y: 430, type: "curve" },
      { x: 220, y: 430, type: "straight" },
      { x: 150, y: 380, type: "curve" },
      { x: 150, y: 330, type: "finish" },
    ],
    width: 60,
    arrows: [
      { x: 180, y: 280 },
      { x: 260, y: 205 },
      { x: 375, y: 195 },
      { x: 455, y: 265 },
      { x: 445, y: 360 },
      { x: 355, y: 420 },
      { x: 245, y: 430 },
      { x: 170, y: 360 },
    ],
    startPosition: { x: 150, y: 330 },
  },

  shanghai: {
    path: [
      { x: 120, y: 280, type: "start" },
      { x: 190, y: 200, type: "curve" },
      { x: 300, y: 170, type: "straight" },
      { x: 410, y: 195, type: "curve" },
      { x: 470, y: 270, type: "curve" },
      { x: 455, y: 360, type: "curve" },
      { x: 360, y: 430, type: "curve" },
      { x: 230, y: 455, type: "curve" },
      { x: 140, y: 400, type: "curve" },
      { x: 120, y: 320, type: "curve" },
      { x: 120, y: 280, type: "finish" },
    ],
    width: 58,
    arrows: [
      { x: 155, y: 235 },
      { x: 255, y: 180 },
      { x: 370, y: 185 },
      { x: 455, y: 250 },
      { x: 450, y: 335 },
      { x: 385, y: 410 },
      { x: 275, y: 445 },
      { x: 175, y: 405 },
      { x: 130, y: 335 },
    ],
    startPosition: { x: 120, y: 280 },
  },
}

// Default track layout for any missing tracks
const DEFAULT_TRACK = {
  path: [
    { x: 150, y: 150, type: "start" },
    { x: 250, y: 150, type: "straight" },
    { x: 350, y: 180, type: "curve" },
    { x: 450, y: 250, type: "curve" },
    { x: 500, y: 350, type: "curve" },
    { x: 450, y: 450, type: "curve" },
    { x: 350, y: 500, type: "curve" },
    { x: 250, y: 480, type: "curve" },
    { x: 150, y: 450, type: "curve" },
    { x: 100, y: 350, type: "curve" },
    { x: 120, y: 250, type: "curve" },
    { x: 150, y: 150, type: "finish" },
  ],
  width: 60,
  arrows: [
    { x: 200, y: 150 },
    { x: 300, y: 165 },
    { x: 400, y: 215 },
    { x: 475, y: 300 },
    { x: 475, y: 400 },
    { x: 400, y: 475 },
    { x: 300, y: 490 },
    { x: 200, y: 465 },
    { x: 125, y: 400 },
    { x: 110, y: 300 },
  ],
  startPosition: { x: 150, y: 150 },
}

// Car sprite dimensions
const CAR_SPRITE = {
  width: 16,
  height: 24,
}

// Function to calculate angle between two points
function getAngleBetween(p1, p2) {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x)
}

export default function HotlapShowdown() {
  const canvasRef = useRef(null)
  const gameLoopRef = useRef(null)
  const resultCardRef = useRef(null)
  const { theme } = useTheme()

  // Game state
  const [gameState, setGameState] = useState("idle") // idle, playing, finished, offtrack
  const [driverName, setDriverName] = useState("")
  const [constructor, setConstructor] = useState(CONSTRUCTORS[0])
  const [currentTrack, setCurrentTrack] = useState(null)
  const [nextTrackTime, setNextTrackTime] = useState("")
  const [bestLap, setBestLap] = useState(null)
  const [previousLap, setPreviousLap] = useState(null)
  const [currentLap, setCurrentLap] = useState(0)
  const [leaderboard, setLeaderboard] = useState([])
  const [showShareCard, setShowShareCard] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [offTrackMessage, setOffTrackMessage] = useState("")
  const [leftKeyPressed, setLeftKeyPressed] = useState(false)
  const [rightKeyPressed, setRightKeyPressed] = useState(false)
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [saveError, setSaveError] = useState(false)
  const [sectors, setSectors] = useState([null, null, null])
  const [bestSectors, setBestSectors] = useState([null, null, null])
  const [currentSector, setCurrentSector] = useState(0)
  const sectorTimesRef = useRef([0, 0, 0])
  const sectorStartTimeRef = useRef(0)

  // Car state
  const carRef = useRef({
    x: 0,
    y: 0,
    angle: 0,
    speed: 0, // Start with 0 speed (idle)
    width: CAR_SPRITE.width,
    height: CAR_SPRITE.height,
    lap: 0,
    checkpoint: 0,
    lapStartTime: 0,
    bestTime: null,
    previousTime: null,
    onTrack: true,
  })

  // Track state
  const trackRef = useRef({
    id: "bahrain",
    layout: TRACK_LAYOUTS.bahrain || DEFAULT_TRACK,
  })

  // Timer state
  const timerRef = useRef({
    start: 0,
    current: 0,
    delta: 0,
  })

  // Helper functions
  const drawArrow = (ctx, x, y, angle) => {
    if (!ctx) return

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)

    // Draw chevron/triangle style arrow
    ctx.fillStyle = theme === "dark" ? "#888" : "#999"
    ctx.beginPath()
    ctx.moveTo(0, -10)
    ctx.lineTo(-6, 6)
    ctx.lineTo(0, 2)
    ctx.lineTo(6, 6)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  }

  // Draw F1-style pixel car using canvas calls only
  const drawCar = (ctx) => {
    if (!ctx) return

    const car = carRef.current
    const teamColors = TEAM_COLORS[constructor.name] || { body: "#666666", accent: "#ffffff" }

    ctx.save()
    ctx.translate(car.x, car.y)
    ctx.rotate(car.angle)

    // Front wing (now at the top, -Y direction)
    ctx.fillStyle = teamColors.accent
    ctx.fillRect(-8, -12, 16, 3)

    // Nose cone (pointed front, now at the top)
    ctx.fillStyle = teamColors.accent
    ctx.fillRect(-1, -14, 2, 2)

    // Main body (central rectangle)
    ctx.fillStyle = teamColors.body
    ctx.fillRect(-4, -10, 8, 20)

    // Cockpit (darker center area)
    ctx.fillStyle = "#000000"
    ctx.fillRect(-2, -6, 4, 8)

    // Side pods (left and right of main body)
    ctx.fillStyle = teamColors.body
    ctx.fillRect(-6, -6, 2, 12)
    ctx.fillRect(4, -6, 2, 12)

    // Wheels (small black rectangles)
    ctx.fillStyle = "#222222"
    ctx.fillRect(-7, -8, 2, 3) // Front left wheel
    ctx.fillRect(5, -8, 2, 3) // Front right wheel
    ctx.fillRect(-7, 5, 2, 3) // Rear left wheel
    ctx.fillRect(5, 5, 2, 3) // Rear right wheel

    // Rear wing (now at the bottom, +Y direction)
    ctx.fillStyle = teamColors.accent
    ctx.fillRect(-8, 9, 16, 3)

    ctx.restore()
  }

  // Update car position based on keys
  const updateCar = (keys) => {
    const car = carRef.current
    const FIXED_SPEED = 2.5 // Fixed speed constant

    // Handle steering
    if (keys.ArrowLeft) {
      car.angle -= 0.06
    }
    if (keys.ArrowRight) {
      car.angle += 0.06
    }

    // Move car forward at absolutely constant speed
    if (car.speed > 0) {
      // Use fixed speed value instead of car.speed to prevent any acceleration
      car.x += Math.sin(car.angle) * FIXED_SPEED
      car.y -= Math.cos(car.angle) * FIXED_SPEED
    }
  }

  // Set assets loaded immediately since we're drawing the car with canvas
  useEffect(() => {
    setAssetsLoaded(true)
  }, [])

  // Initialize game
  useEffect(() => {
    setIsLoading(true)

    // Determine current track based on time - switch every 30 minutes
    const determineTrack = () => {
      const now = new Date()
      const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes()
      const trackIndex = Math.floor(minutesSinceMidnight / 30) % F1_TRACKS.length
      return F1_TRACKS[trackIndex]
    }

    // Calculate time until next track
    const calculateNextTrackTime = () => {
      const now = new Date()
      const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes()
      const minutesUntilNext = 30 - (minutesSinceMidnight % 30)

      const hours = Math.floor(minutesUntilNext / 60)
      const minutes = minutesUntilNext % 60
      const seconds = 60 - now.getSeconds()

      return `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`
    }

    // Update track and next track time
    const track = determineTrack()
    setCurrentTrack(track)
    trackRef.current.id = track.id
    trackRef.current.layout = TRACK_LAYOUTS[track.id] || DEFAULT_TRACK
    setNextTrackTime(calculateNextTrackTime())

    // Update next track time every second and check for track changes
    const interval = setInterval(() => {
      const newTime = calculateNextTrackTime()
      setNextTrackTime(newTime)

      const freshTrack = determineTrack()
      if (currentTrack?.id !== freshTrack.id) {
        setCurrentTrack(freshTrack)
      }
    }, 1000)

    // Load leaderboard
    loadLeaderboard(track.id).then(() => {
      setIsLoading(false)
    })

    // Try to load saved driver name from localStorage
    const savedName = localStorage.getItem("hotlap_driver_name")
    if (savedName) {
      setDriverName(savedName)
    }

    // Try to load saved constructor from localStorage
    const savedConstructorId = localStorage.getItem("hotlap_constructor_id")
    if (savedConstructorId) {
      const savedConstructor = CONSTRUCTORS.find((c) => c.id === savedConstructorId)
      if (savedConstructor) {
        setConstructor(savedConstructor)
      }
    }

    // Calculate the correct starting angle based on the first two points
    const path = trackRef.current.layout.path
    const startPos = trackRef.current.layout.startPosition

    // Calculate angle between first two points of the track
    const startAngle = getAngleBetween(path[0], path[1]) + Math.PI / 2

    // Initialize car position at the start line with the correct angle
    carRef.current.x = startPos.x
    carRef.current.y = startPos.y
    carRef.current.angle = startAngle
    carRef.current.speed = 0 // Start idle

    return () => clearInterval(interval)
  }, [])

  // Initialize canvas when assets are loaded
  useEffect(() => {
    if (assetsLoaded) {
      initializeCanvas()
    }
  }, [assetsLoaded, theme])

  // Initialize canvas
  const initializeCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")

    // Set canvas dimensions
    canvas.width = 600
    canvas.height = 600

    // Draw initial state
    drawTrack(ctx)
    drawCar(ctx)
  }

  // Load leaderboard from the correct table
  const loadLeaderboard = async (trackId) => {
    try {
      const data = await getTopScores(trackId, 10)
      setLeaderboard(data || [])
      return data
    } catch (error) {
      console.error("Error loading leaderboard:", error)
      return []
    }
  }

  // Save lap time to the correct table with proper validation
  const saveScore = async (lapTimeMs) => {
    if (!driverName || !currentTrack) {
      console.error("Cannot save score: Missing driver name or track")
      return false
    }

    // Validate all required fields
    if (!driverName.trim()) {
      console.error("Cannot save score: Driver name is empty")
      return false
    }

    if (!constructor.name || !constructor.id) {
      console.error("Cannot save score: Constructor data is missing")
      return false
    }

    if (!currentTrack.id) {
      console.error("Cannot save score: Track ID is missing")
      return false
    }

    if (!lapTimeMs || lapTimeMs <= 0) {
      console.error("Cannot save score: Invalid lap time", lapTimeMs)
      return false
    }

    try {
      // Save driver name and constructor to localStorage
      localStorage.setItem("hotlap_driver_name", driverName)
      localStorage.setItem("hotlap_constructor_id", constructor.id)

      // Save to the correct table with proper field names
      const success = await saveLapTime(
        driverName.trim(),
        constructor.name,
        constructor.id,
        currentTrack.id,
        Math.floor(lapTimeMs), // Ensure lap_time is an integer
      )

      if (success) {
        // Reload leaderboard after successful insert
        await loadLeaderboard(currentTrack.id)
        return true
      }

      return false
    } catch (error) {
      console.error("Error saving lap time:", error)
      return false
    }
  }

  // Format time in seconds to MM:SS.mmm
  const formatTime = (timeInMs) => {
    if (!timeInMs) return "00.000"
    const seconds = Math.floor(timeInMs / 1000)
    const milliseconds = Math.floor(timeInMs % 1000)
    return `${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`
  }

  // Check if car is on track
  const isCarOnTrack = (x, y) => {
    const layout = trackRef.current.layout
    const trackWidth = layout.width

    // Check distance from track center line
    for (let i = 0; i < layout.path.length - 1; i++) {
      const p1 = layout.path[i]
      const p2 = layout.path[i + 1]

      // Calculate distance from point to line segment
      const A = x - p1.x
      const B = y - p1.y
      const C = p2.x - p1.x
      const D = p2.y - p1.y

      const dot = A * C + B * D
      const lenSq = C * C + D * D
      let param = -1
      if (lenSq !== 0) param = dot / lenSq

      let xx, yy

      if (param < 0) {
        xx = p1.x
        yy = p1.y
      } else if (param > 1) {
        xx = p2.x
        yy = p2.y
      } else {
        xx = p1.x + param * C
        yy = p1.y + param * D
      }

      const dx = x - xx
      const dy = y - yy
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance <= trackWidth / 2 + 6) {
        // allow 6px leeway
        return true
      }
    }
    return false
  }

  // Reset car to starting position
  const resetCar = () => {
    const car = carRef.current
    const path = trackRef.current.layout.path
    const startPos = trackRef.current.layout.startPosition

    // Calculate the correct starting angle based on the first two points
    const startAngle = getAngleBetween(path[0], path[1]) + Math.PI / 2

    car.x = startPos.x
    car.y = startPos.y
    car.angle = startAngle
    car.lap = 0
    car.checkpoint = 0
    car.lapStartTime = 0
    car.onTrack = true
    car.speed = 0 // Reset to idle speed

    timerRef.current.start = 0
    timerRef.current.current = 0
    setCurrentLap(0)
    setOffTrackMessage("")
    setGameState("idle")

    // Redraw canvas
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      drawTrack(ctx)
      drawCar(ctx)
    }
  }

  // Start the game
  const startGame = () => {
    if (!driverName) {
      alert("Please enter your driver name")
      return
    }

    const car = carRef.current
    car.speed = 2.5 // Set flag that car is moving, but use FIXED_SPEED in updateCar
    car.lapStartTime = Date.now()
    timerRef.current.start = Date.now()

    // Initialize sector timing
    sectorStartTimeRef.current = Date.now()
    sectorTimesRef.current = [0, 0, 0]
    setCurrentSector(0)

    setGameState("playing")
  }

  // Check if car has completed a lap
  const checkLapCompletion = () => {
    const car = carRef.current
    const startPoint = trackRef.current.layout.path[0]
    const path = trackRef.current.layout.path

    // Check if car is near start/finish line
    const distance = Math.sqrt(Math.pow(car.x - startPoint.x, 2) + Math.pow(car.y - startPoint.y, 2))

    if (distance < 20) {
      // Only count if we've been away from the line (using checkpoint system)
      if (car.checkpoint > 0) {
        const lapTime = Date.now() - car.lapStartTime

        // Complete the final sector
        const finalSectorTime = Date.now() - sectorStartTimeRef.current
        sectorTimesRef.current[2] = finalSectorTime

        // Update sectors display
        setSectors([...sectorTimesRef.current])

        // Update best sectors
        const newBestSectors = [...bestSectors]
        sectorTimesRef.current.forEach((time, index) => {
          if (!newBestSectors[index] || time < newBestSectors[index]) {
            newBestSectors[index] = time
          }
        })
        setBestSectors(newBestSectors)

        // Update previous lap
        setPreviousLap(lapTime)
        car.previousTime = lapTime

        // Update best lap if better
        if (!car.bestTime || lapTime < car.bestTime) {
          setBestLap(lapTime)
          car.bestTime = lapTime

          // Save to leaderboard if it's a valid lap
          if (car.lap > 0) {
            saveScore(lapTime)
          }
        }

        // Reset lap timer and sectors
        car.lapStartTime = Date.now()
        sectorStartTimeRef.current = Date.now()
        sectorTimesRef.current = [0, 0, 0]
        setCurrentSector(0)
        car.lap++
        car.checkpoint = 0

        // Show share card after completing a lap
        if (car.lap > 0) {
          setShowShareCard(true)
          setGameState("finished")
          cancelAnimationFrame(gameLoopRef.current)
        }
      }
    } else if (distance > 100 && car.checkpoint === 0) {
      // Passed first checkpoint
      car.checkpoint = 1
    }

    // Check sector checkpoints (simplified - in a real implementation, you'd have actual checkpoints)
    // This is a simplified version that divides the track into 3 equal parts
    const totalCheckpoints = path.length
    const sector1End = Math.floor(totalCheckpoints / 3)
    const sector2End = Math.floor((totalCheckpoints * 2) / 3)

    // Find closest point on track to determine current position
    let closestPointIndex = 0
    let minDistance = Number.POSITIVE_INFINITY

    for (let i = 0; i < path.length; i++) {
      const pointDistance = Math.sqrt(Math.pow(car.x - path[i].x, 2) + Math.pow(car.y - path[i].y, 2))
      if (pointDistance < minDistance) {
        minDistance = pointDistance
        closestPointIndex = i
      }
    }

    // Check if we've entered a new sector
    if (currentSector === 0 && closestPointIndex >= sector1End) {
      const sectorTime = Date.now() - sectorStartTimeRef.current
      sectorTimesRef.current[0] = sectorTime
      sectorStartTimeRef.current = Date.now()
      setCurrentSector(1)
    } else if (currentSector === 1 && closestPointIndex >= sector2End) {
      const sectorTime = Date.now() - sectorStartTimeRef.current
      sectorTimesRef.current[1] = sectorTime
      sectorStartTimeRef.current = Date.now()
      setCurrentSector(2)
    }
  }

  // Game loop
  useEffect(() => {
    if (gameState !== "playing") return

    // Key state
    const keys = {
      ArrowLeft: false,
      ArrowRight: false,
    }

    // Key event listeners
    const handleKeyDown = (event) => {
      if (!event) return

      if (event.code === "ArrowLeft") {
        keys.ArrowLeft = true
        setLeftKeyPressed(true)
      }
      if (event.code === "ArrowRight") {
        keys.ArrowRight = true
        setRightKeyPressed(true)
      }

      // Prevent default browser actions
      if (["ArrowLeft", "ArrowRight", "Space", "KeyR"].includes(event.code)) {
        event.preventDefault()
      }
    }

    const handleKeyUp = (event) => {
      if (!event) return

      if (event.code === "ArrowLeft") {
        keys.ArrowLeft = false
        setLeftKeyPressed(false)
      }
      if (event.code === "ArrowRight") {
        keys.ArrowRight = false
        setRightKeyPressed(false)
      }

      // Prevent default browser actions
      if (["ArrowLeft", "ArrowRight", "Space", "KeyR"].includes(event.code)) {
        event.preventDefault()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")

    // Game loop
    const gameLoop = () => {
      // Clear canvas
      ctx.fillStyle = theme === "dark" ? "#111" : "#f5f5f5"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw track
      drawTrack(ctx)

      // Update car position
      updateCar(keys)

      // Check track limits
      if (!isCarOnTrack(carRef.current.x, carRef.current.y)) {
        if (carRef.current.onTrack) {
          carRef.current.onTrack = false
          setOffTrackMessage("Track limits exceeded — press R to restart")
          setGameState("offtrack")
          cancelAnimationFrame(gameLoopRef.current)
          return
        }
      }

      // Draw car
      drawCar(ctx)

      // Update timer
      timerRef.current.current = Date.now() - timerRef.current.start
      setCurrentLap(timerRef.current.current)

      // Calculate delta time if best lap exists
      if (carRef.current.bestTime) {
        const elapsed = Date.now() - carRef.current.lapStartTime
        const bestAtThisPoint = (elapsed / carRef.current.bestTime) * carRef.current.bestTime
        timerRef.current.delta = elapsed - bestAtThisPoint
      }

      // Check for lap completion
      checkLapCompletion()

      // Request next frame
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    // Start game loop
    gameLoopRef.current = requestAnimationFrame(gameLoop)

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      cancelAnimationFrame(gameLoopRef.current)
    }
  }, [gameState, theme])

  // Handle R key for restart and Space for start
  useEffect(() => {
    const isTyping = () => document.activeElement && ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)

    const handleKeyDown = (event) => {
      if (!event) return

      if (isTyping()) return

      if (event.code === "KeyR" && gameState === "offtrack") {
        resetCar()
        event.preventDefault()
      }

      if (event.code === "Space" && gameState === "idle") {
        startGame()
        event.preventDefault()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [gameState])

  // Prevent default browser actions for game keys
  useEffect(() => {
    const isTyping = () => document.activeElement && ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)

    const preventDefaultForGameKeys = (event) => {
      if (!event) return
      if (isTyping()) return

      if (["ArrowLeft", "ArrowRight", "Space", "KeyR"].includes(event.code)) {
        event.preventDefault()
      }
    }

    window.addEventListener("keydown", preventDefaultForGameKeys)
    return () => window.removeEventListener("keydown", preventDefaultForGameKeys)
  }, [])

  // Draw track on canvas
  const drawTrack = (ctx) => {
    if (!ctx) return

    const layout = trackRef.current.layout
    const path = layout.path
    const trackWidth = layout.width

    // Draw track surface
    ctx.strokeStyle = theme === "dark" ? "#666" : "#ddd"
    ctx.lineWidth = trackWidth
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.beginPath()

    // Draw smooth curves
    ctx.moveTo(path[0].x, path[0].y)
    for (let i = 1; i < path.length; i++) {
      const current = path[i]
      const previous = path[i - 1]
      const next = path[i + 1] || path[0]

      // Calculate control points for smooth curves
      const cp1x = previous.x + (current.x - previous.x) * 0.5
      const cp1y = previous.y + (current.y - previous.y) * 0.5
      const cp2x = current.x - (next.x - current.x) * 0.2
      const cp2y = current.y - (next.y - current.y) * 0.2

      ctx.quadraticCurveTo(cp1x, cp1y, current.x, current.y)
    }
    ctx.stroke()

    // Draw outer kerb zone (white)
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = trackWidth + 8
    ctx.stroke()

    // Red striped kerb
    ctx.strokeStyle = "#DDDDDD"
    ctx.setLineDash([8, 4])
    ctx.lineWidth = trackWidth + 4
    ctx.stroke()
    ctx.setLineDash([])

    // Draw track center line
    ctx.strokeStyle = theme === "dark" ? "#444" : "#ccc"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(path[0].x, path[0].y)
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y)
    }
    ctx.stroke()

    // Draw start/finish line
    const startPoint = path[0]
    const startAngle = getAngleBetween(path[0], path[1])

    ctx.save()
    ctx.translate(startPoint.x, startPoint.y)
    ctx.rotate(startAngle)
    ctx.fillStyle = "#fff"
    ctx.fillRect(-trackWidth / 2, -5, trackWidth, 10) // spans full track

    // Draw checkered pattern on start/finish
    ctx.fillStyle = "#000"
    const checkerSize = 5
    const checkerCount = Math.floor(trackWidth / checkerSize)
    for (let i = 0; i < checkerCount; i++) {
      for (let j = 0; j < 2; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillRect(-trackWidth / 2 + i * checkerSize, -5 + j * 5, checkerSize, 5)
        }
      }
    }
    ctx.restore()

    // Draw direction arrows on track with proper orientation
    if (layout.arrows && layout.arrows.length > 0) {
      // Draw arrows along the racing line
      for (let i = 0; i < layout.arrows.length; i++) {
        const arrowPos = layout.arrows[i]

        // Find the closest points on the path to calculate direction
        let closestIndex = 0
        let minDistance = Number.POSITIVE_INFINITY

        for (let j = 0; j < path.length; j++) {
          const distance = Math.sqrt(Math.pow(arrowPos.x - path[j].x, 2) + Math.pow(arrowPos.y - path[j].y, 2))

          if (distance < minDistance) {
            minDistance = distance
            closestIndex = j
          }
        }

        // Get next point to determine direction (wrap around to start if at end)
        const nextIndex = (closestIndex + 1) % path.length

        // Calculate angle between current point and next point
        const angle = getAngleBetween(path[closestIndex], path[nextIndex])

        // Draw arrow with calculated angle + 90 degrees (Math.PI/2)
        drawArrow(ctx, arrowPos.x, arrowPos.y, angle + Math.PI / 2)
      }
    }
  }

  // Save lap time to the leaderboard
  const saveToLeaderboard = async (lapTime) => {
    if (!lapTime || lapTime <= 0) {
      setSaveError(true)
      setSaveMessage("Invalid lap time")
      return
    }

    setSaveMessage("Saving lap time...")
    setSaveError(false)

    try {
      const success = await saveScore(lapTime)

      if (success) {
        setSaveMessage("Lap time saved successfully!")
        setSaveError(false)

        // Clear message after 3 seconds
        setTimeout(() => {
          setSaveMessage("")
        }, 3000)
      } else {
        setSaveError(true)
        setSaveMessage("Failed to save lap time")
      }
    } catch (error) {
      console.error("Error saving lap time:", error)
      setSaveError(true)
      setSaveMessage("Error saving lap time")
    }
  }

  // Reset the game
  const resetGame = () => {
    setShowShareCard(false)
    setSaveMessage("")
    setSaveError(false)
    resetCar()
  }

  // Download result card as PNG
  const downloadResultCard = async () => {
    if (!resultCardRef.current) return

    try {
      const canvas = await html2canvas(resultCardRef.current, {
        backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
        scale: 2,
      })

      const link = document.createElement("a")
      link.download = `hotlap-${driverName}-${currentTrack?.id}-${formatTime(bestLap)}.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error("Error downloading result card:", error)
      alert("Error downloading result card")
    }
  }

  // Share lap time
  const shareLapTime = () => {
    const shareText = `🏎️ Just set a ${formatTime(bestLap)} lap time driving for ${constructor.name}! #HotlapShowdown`

    if (navigator.share) {
      navigator.share({
        title: "Hotlap Showdown",
        text: shareText,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(shareText)
      alert("Lap time copied to clipboard!")
    }
  }

  // Handle input changes with proper null checks
  const handleDriverNameChange = (event) => {
    if (event && event.target) {
      setDriverName(event.target.value)
    }
  }

  const handleConstructorChange = (event) => {
    if (event && event.target) {
      const selectedConstructor = CONSTRUCTORS.find((c) => c.id === event.target.value)
      if (selectedConstructor) {
        setConstructor(selectedConstructor)
      }
    }
  }
  useEffect(() => {
    if (!currentTrack) return

    // Store current speed before track change
    const currentSpeed = carRef.current.speed
    const wasPlaying = gameState === "playing"

    // Update trackRef with new layout
    trackRef.current.id = currentTrack.id
    trackRef.current.layout = TRACK_LAYOUTS[currentTrack.id] || DEFAULT_TRACK

    // Reset car position for new track but preserve speed if playing
    const path = trackRef.current.layout.path
    const startPos = trackRef.current.layout.startPosition
    const startAngle = getAngleBetween(path[0], path[1]) + Math.PI / 2

    carRef.current.x = startPos.x
    carRef.current.y = startPos.y
    carRef.current.angle = startAngle
    carRef.current.lap = 0
    carRef.current.checkpoint = 0
    carRef.current.onTrack = true

    // Preserve speed if game was playing, otherwise reset to 0
    if (wasPlaying) {
      carRef.current.speed = currentSpeed || 2.5 // Maintain speed or set to default playing speed
      carRef.current.lapStartTime = Date.now() // Reset lap timer
      // Reset sector timing
      sectorStartTimeRef.current = Date.now()
      sectorTimesRef.current = [0, 0, 0]
      setCurrentSector(0)
      timerRef.current.start = Date.now()
    } else {
      carRef.current.speed = 0 // Idle speed
      carRef.current.lapStartTime = 0
    }

    // Redraw canvas with new track
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      drawTrack(ctx)
      drawCar(ctx)
    }

    // Load leaderboard for new track
    loadLeaderboard(currentTrack.id)
  }, [currentTrack])
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto p-4 font-mono">
      <h1 className="text-2xl md:text-4xl font-bold mb-2 tracking-wider">HOTLAP SHOWDOWN</h1>

      <div className="text-sm mb-4">
        <p className="text-center">Next track in: {nextTrackTime}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full border-2 border-gray-800 dark:border-gray-200 p-4">
        {/* Left Panel */}
        <div className="flex flex-col space-y-4 border border-gray-400 p-4">
          <div>
            <label className="block uppercase text-xs mb-1">Driver Name</label>
            <input
              type="text"
              value={driverName}
              onChange={handleDriverNameChange}
              disabled={gameState === "playing"}
              className="w-full px-2 py-1 border border-gray-400 bg-white dark:bg-gray-800"
              placeholder="Enter name"
            />
          </div>

          <div>
            <label className="block uppercase text-xs mb-1">Constructor</label>
            <div className="relative">
              <select
                value={constructor.id}
                onChange={handleConstructorChange}
                disabled={gameState === "playing"}
                className="w-full px-2 py-1 pl-8 border border-gray-400 bg-white dark:bg-gray-800 appearance-none"
                style={{ color: constructor.color }}
              >
                {CONSTRUCTORS.map((c) => (
                  <option key={c.id} value={c.id} style={{ color: c.color }}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-contain bg-no-repeat">
                <img
                  src={constructor.image || "/placeholder.svg"}
                  alt={constructor.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none"
                    e.target.nextSibling.style.display = "block"
                  }}
                />
                <div
                  style={{ backgroundColor: constructor.color, width: "100%", height: "100%", display: "none" }}
                ></div>
              </div>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0L6 6L12 0H0Z" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>

          {gameState === "idle" && (
            <button onClick={startGame} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 text-center">
              PRESS SPACE TO BEGIN
            </button>
          )}

          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              <div
                className="border border-gray-400 px-4 py-2 transition-all duration-150"
                style={{
                  backgroundColor: leftKeyPressed ? constructor.color : "transparent",
                  transform: leftKeyPressed ? "scale(1.2)" : "scale(1)",
                  transition: "transform 0.15s ease, background-color 0.15s ease",
                }}
              >
                ←
              </div>
              <div
                className="border border-gray-400 px-4 py-2 transition-all duration-150"
                style={{
                  backgroundColor: rightKeyPressed ? constructor.color : "transparent",
                  transform: rightKeyPressed ? "scale(1.2)" : "scale(1)",
                  transition: "transform 0.15s ease, background-color 0.15s ease",
                }}
              >
                →
              </div>
            </div>
          </div>

          <button
            onClick={() => (bestLap ? setShowShareCard(true) : alert("Complete a lap first to drop it."))}
            className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 text-center mt-4"
          >
            ⚡ LAP DROP
          </button>

          <div className="mt-4">
            <h3 className="text-sm font-bold mb-2">LEADERBOARD</h3>
            {isLoading ? (
              <p className="text-center text-sm">Loading...</p>
            ) : (
              <div className="text-xs space-y-1 max-h-60 overflow-y-auto">
                {leaderboard.map((entry, index) => (
                  <div key={index} className="flex justify-between">
                    <span>
                      {index + 1}. {entry.driver_name} ({entry.constructor_name})
                    </span>
                    <span>{formatTime(entry.lap_time)}</span>
                  </div>
                ))}
                {leaderboard.length === 0 && <p>No lap times yet</p>}
              </div>
            )}
          </div>
        </div>

        {/* Center Panel - Game Canvas */}
        <div className="col-span-1 md:col-span-2 relative">
          <canvas ref={canvasRef} className="w-full h-auto border border-gray-400 bg-gray-100 dark:bg-gray-900" />

          {/* Timer Display */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-400 px-4 py-1">
            {formatTime(currentLap)}
          </div>

          {/* Sector Indicators */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {sectors.map((time, i) => (
              <div
                key={i}
                className="w-8 h-4 rounded"
                style={{
                  backgroundColor: !bestSectors[i]
                    ? "#888"
                    : time < bestSectors[i]
                      ? "#6bff6b" // green
                      : time === bestSectors[i]
                        ? "#b46bff" // purple
                        : "#ffff6b", // yellow
                }}
              ></div>
            ))}
          </div>

          {/* Delta Bar */}
          {bestLap && gameState === "playing" && (
            <div className="absolute bottom-18 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-gray-200 dark:bg-gray-700">
              <div
                className={`h-full ${timerRef.current.delta < 0 ? "bg-green-500" : "bg-red-500"}`}
                style={{ width: `${Math.min((Math.abs(timerRef.current.delta) / 1000) * 100, 100)}%` }}
              ></div>
            </div>
          )}

          {/* Off Track Message */}
          {gameState === "offtrack" && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
              <div className="bg-red-600 text-white p-4 rounded text-center">
                <p className="font-bold">{offTrackMessage}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lap Times Display */}
      <div className="grid grid-cols-2 gap-4 mt-4 w-full max-w-md">
        <div className="text-center">
          <p className="text-xs uppercase">Best</p>
          <p className="font-bold">{bestLap ? formatTime(bestLap) : "---.---"}</p>
        </div>
        <div className="text-center">
          <p className="text-xs uppercase">Previous</p>
          <p className="font-bold">{previousLap ? formatTime(previousLap) : "---.---"}</p>
        </div>
      </div>

      {/* Share Card Modal */}
      {showShareCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Lap Completed!</h2>

            <div ref={resultCardRef} className="border-2 border-gray-300 p-4 mb-4 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
                  <img
                    src={constructor.image || "/placeholder.svg"}
                    alt={constructor.name}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      e.target.style.display = "none"
                      e.target.nextSibling.style.display = "block"
                    }}
                  />
                  <div
                    style={{ backgroundColor: constructor.color, width: "50%", height: "50%", display: "none" }}
                  ></div>
                </div>
                <div>
                  <p className="font-bold text-black dark:text-white">{driverName}</p>
                  <p className="text-black dark:text-white">{constructor.name}</p>
                  <p className="text-2xl font-bold text-black dark:text-white">{formatTime(bestLap)}</p>
                  <p className="text-xs text-black dark:text-white">Next track in: {nextTrackTime}</p>
                  <p className="text-xs text-black dark:text-white">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex space-x-2">
                <button
                  onClick={downloadResultCard}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 flex-1"
                >
                  Download
                </button>
                <button onClick={shareLapTime} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 flex-1">
                  Share
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => saveToLeaderboard(previousLap)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 flex-1"
                >
                  Save to Leaderboard
                </button>
                <button onClick={resetGame} className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 flex-1">
                  Cancel
                </button>
              </div>
              {saveMessage && (
                <div className={`text-center py-2 ${saveError ? "text-red-500" : "text-green-500"}`}>{saveMessage}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
