"use client"

import { motion } from "framer-motion"

export default function GameCard({ game, onClick, delay = 0 }) {
  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-xl shadow-lg cursor-pointer
        ${game.disabled ? "opacity-70" : "hover:shadow-xl"}
        transition-all duration-300 ease-in-out
        bg-white dark:bg-gray-800
      `}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div
            className={`
            w-12 h-12 rounded-full flex items-center justify-center text-2xl
            bg-gradient-to-br ${game.color} text-white
          `}
          >
            {game.icon}
          </div>
          <h2 className="text-2xl font-bold ml-4">{game.title}</h2>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4">{game.description}</p>

        <div className="flex justify-end">
          <motion.button
            className={`
              px-4 py-2 rounded-lg font-medium
              ${
                game.disabled
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : `bg-gradient-to-r ${game.color} text-white hover:shadow-md`
              }
            `}
            whileHover={{ scale: game.disabled ? 1 : 1.05 }}
            whileTap={{ scale: game.disabled ? 1 : 0.95 }}
          >
            {game.disabled ? "Coming Soon" : "Play Now"}
          </motion.button>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br from-black to-transparent"></div>
      <div className="absolute -top-6 -left-6 w-16 h-16 rounded-full opacity-10 bg-gradient-to-br from-black to-transparent"></div>
    </motion.div>
  )
}
