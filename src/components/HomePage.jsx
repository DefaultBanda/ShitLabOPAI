"use client"

import { motion } from "framer-motion"
import GameCard from "./GameCard"

export default function HomePage({ onSelectGame }) {
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
      description: "Coming soon: Visualize wave interference and propagation",
      color: "from-pink-500 to-rose-400",
      icon: "🌊",
      disabled: true,
    },
  ]

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
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {games.map((game, index) => (
          <GameCard
            key={game.id}
            game={game}
            onClick={() => !game.disabled && onSelectGame(game.id)}
            delay={0.5 + index * 0.1}
          />
        ))}
      </motion.div>
    </div>
  )
}
