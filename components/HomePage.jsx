"use client"

import { motion } from "framer-motion"
import GameCard from "./ui/GameCard"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  const games = [
    {
      id: "projectile",
      title: "Projectile Motion",
      description: "Explore the physics of projectile motion with interactive controls",
      color: "from-blue-500 to-cyan-400",
      icon: "📊",
    },
    {
      id: "bouncing",
      title: "Bouncing Ball",
      description: "Simulate elastic collisions and energy conservation",
      color: "from-green-500 to-emerald-400",
      icon: "🏀",
    },
    {
      id: "pendulum",
      title: "Pendulum",
      description: "Explore simple pendulum physics and harmonic motion",
      color: "from-purple-500 to-indigo-400",
      icon: "🔄",
    },
    {
      id: "waves",
      title: "Wave Simulator",
      description: "Visualize wave interference and propagation",
      color: "from-pink-500 to-rose-400",
      icon: "🌊",
    },
    {
      id: "wall-break-escape",
      title: "Wall Break Escape",
      description: "Watch a ball break through polygon walls and escape",
      color: "from-orange-500 to-amber-400",
      icon: "🔨",
    },
    {
      id: "momentum-clash",
      title: "Momentum Clash",
      description: "Explore conservation of momentum in different collision types",
      color: "from-blue-500 to-purple-400",
      icon: "💥",
    },
    {
      id: "spend-elon",
      title: "Spend Elon's Money",
      description: "Try to spend $486.4 billion by purchasing various items",
      color: "from-green-500 to-teal-400",
      icon: "💰",
    },
    {
      id: "f1-reaction",
      title: "F1 Reaction Test",
      description: "Test your reaction time with F1 start lights and pit stop challenges",
      color: "from-red-500 to-orange-400",
      icon: "🏎️",
    },
    {
      id: "black-hole",
      title: "Black Hole Simulation",
      description: "Watch particles interact with a simulated black hole",
      color: "from-gray-800 to-purple-900",
      icon: "🌌",
    },
    {
      id: "magnetic-fields",
      title: "Magnetic Fields",
      description: "Explore magnetic fields with interactive bar magnets and electromagnets",
      color: "from-blue-500 to-purple-600",
      icon: "🧲",
    },
    {
      id: "flappy-bird",
      title: "Not Flappy Bird",
      description: "Play an enhanced version of the classic Flappy Bird game with power-ups",
      color: "from-yellow-500 to-yellow-300",
      icon: "🐦",
    },
    {
      id: "hotlap-showdown",
      title: "Hotlap Showdown",
      description: "F1-inspired pixel racing game with Franz Hermann",
      color: "from-red-600 to-red-400",
      icon: "🏎️",
    },
    {
      id: "f1-stats",
      title: "F1 Stats",
      description: "View race schedules and latest results",
      color: "from-red-700 to-red-500",
      icon: "📊",
    },
    {
      id: "photoelectric-effect",
      title: "Photoelectric Effect",
      description: "Simulate the photoelectric effect with adjustable light",
      color: "from-indigo-500 to-sky-400",
      icon: "⚡"
    },
    {
      id: "grade-calculator",
      title: "Final Grade Calculator",
      description: "Compute exam requirements and final grades",
      color: "from-green-600 to-emerald-400",
      icon: "📈",
    },
  ]

  const handleSelectGame = (gameId) => {
    router.push(`/simulations/${gameId}`)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.h1
        className="text-4xl md:text-6xl font-bold text-center mb-4 mt-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        RandomSh!t Lab
      </motion.h1>

      <motion.p
        className="text-xl text-center mb-12 text-gray-600 dark:text-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Explore random concepts through fun, interactive simulations
      </motion.p>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {games.map((game, index) => (
          <GameCard key={game.id} game={game} onClick={() => handleSelectGame(game.id)} delay={0.5 + index * 0.1} />
        ))}
      </motion.div>
    </div>
  )
}
