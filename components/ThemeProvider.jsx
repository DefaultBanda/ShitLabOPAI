"use client"

import { createContext, useContext, useEffect, useState } from "react"
import ThemeToggle from "./ui/ThemeToggle"
import Link from "next/link"

const ThemeContext = createContext()

export function useTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Initialize theme based on user preference or system setting
  useEffect(() => {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem("theme")

    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDark(true)
      document.documentElement.classList.add("dark")
    }
    setMounted(true)
  }, [])

  // Toggle theme
  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    } else {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    }
    setIsDark(!isDark)
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <header className="container mx-auto py-4 px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-3">
          <img src="/SimL.png" alt="Physics Lab Logo" className="h-10 w-auto block dark:hidden" />
          <img src="/SimLD.png" alt="Physics Lab Logo" className="h-10 w-auto hidden dark:block" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            RandomSh!t Lab
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="container mx-auto py-4 px-4">{mounted && children}</main>

      <footer className="container mx-auto py-6 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Created by Karman B, Ramneek N, Ishvir C, and David Y</p>
      </footer>
    </ThemeContext.Provider>
  )
}
