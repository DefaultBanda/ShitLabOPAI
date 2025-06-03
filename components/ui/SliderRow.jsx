"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"

export default function SliderRow({ label, value, min, max, step, onChange, unit = "" }) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(value.toString())
  const inputRef = useRef(null)

  // Handle click on the value to enable editing
  const handleValueClick = () => {
    setInputValue(value.toString())
    setIsEditing(true)
    // Focus the input after it appears
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }, 10)
  }

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  // Handle input blur or Enter key
  const handleInputBlur = () => {
    applyValue()
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      applyValue()
    } else if (e.key === "Escape") {
      setIsEditing(false)
    }
  }

  // Apply the new value
  const applyValue = () => {
    const newValue = Number.parseFloat(inputValue)
    if (!isNaN(newValue)) {
      onChange(newValue)
    }
    setIsEditing(false)
  }

  return (
    <div className="mb-3">
      <label className="flex justify-between items-center text-sm mb-1">
        <span className="font-medium">{label}</span>
        {isEditing ? (
          <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              className="w-16 bg-transparent font-mono text-right focus:outline-none"
              aria-label={`Edit ${label}`}
            />
            <span className="ml-1">{unit}</span>
          </div>
        ) : (
          <motion.span
            key={value}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={handleValueClick}
            title="Click to edit"
          >
            {value}
            {unit}
          </motion.span>
        )}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(Math.max(value, min), max)} // Clamp value to slider range
        onChange={(e) => onChange(Number.parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        aria-label={label}
      />
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  )
}
