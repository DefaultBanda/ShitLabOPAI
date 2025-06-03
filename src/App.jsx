"use client"

import { useState } from "react"
import HomePage from "./components/HomePage"
import ProjectileMotion from "./components/ProjectileMotion"
import ThemeToggle from "./components/ThemeToggle"
import BouncingBall from "./components/BouncingBall"
import Pendulum from "./components/Pendulum"

function App() {
  const [currentGame, setCurrentGame] = useState(null)

  // Function to go back to home page
  const goHome = () => setCurrentGame(null)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <header className="container mx-auto py-4 px-4 flex justify-between items-center">
        <button
          onClick={goHome}
          className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
        >
          RandomSh!t Lab
        </button>
        <ThemeToggle />
      </header>

      <main className="container mx-auto py-4 px-4">
        {currentGame === null && <HomePage onSelectGame={setCurrentGame} />}
        {currentGame === "projectile" && <ProjectileMotion />}
        {currentGame === "bouncing" && <BouncingBall />}
        {currentGame === "pendulum" && <Pendulum />}
      </main>

      <footer className="container mx-auto py-6 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Created with React, Tailwind CSS, and Framer Motion</p>
      </footer>
    </div>
  )
}

export default App
