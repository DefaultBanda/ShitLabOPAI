"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ProjectileCanvas from "./ProjectileCanvas"
import XyReadout from "./XyReadout"
import VectorComponents from "./VectorComponents"
import SliderRow from "../ui/SliderRow"

export default function ProjectileMotion() {
  // Basic physics parameters
  const [angle, setAngle] = useState(45)
  const [speed, setSpeed] = useState(20) // m/s
  const [gravity, setGravity] = useState(9.8) // m/s²
  const [initialHeight, setInitialHeight] = useState(0) // meters

  // Advanced physics parameters
  const [mass, setMass] = useState(1) // kg
  const [Cd, setCd] = useState(0.47)
  const [area, setArea] = useState(0.01) // m²
  const [wind, setWind] = useState(0) // m/s
  const [airResistance, setAirResistance] = useState(0.1)

  // UI state
  const [advancedOn, setAdvancedOn] = useState(false)
  const [launchKey, setLaunchKey] = useState(0)
  const [isLaunched, setIsLaunched] = useState(false)

  // Refs
  const xyRef = useRef(null)

  // Change the updateVelocity function to use a ref instead of state for frequent updates
  const velocityRef = useRef({ vx: 0, vy: 0 })
  // Update velocity components for visualization
  const updateVelocity = (vx, vy) => {
    // Store velocity in ref to avoid re-renders on every frame
    velocityRef.current = { vx, vy }

    // Only update state occasionally to avoid excessive re-renders
    // This is a common pattern for high-frequency updates
    if (xyRef.current) {
      xyRef.current.update(vx, vy)
    }
  }

  // Handle launch button click
  const handleLaunch = () => {
    setLaunchKey((k) => k + 1)
    setIsLaunched(true)
  }

  // Reset simulation
  const handleReset = () => {
    setIsLaunched(false)
    // We don't reset launchKey here to avoid triggering a new launch
  }

  return (
    <motion.div
      className="w-full max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <motion.h2
          className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Projectile Motion Simulator
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={advancedOn}
              onChange={() => setAdvancedOn(!advancedOn)}
              className="sr-only peer"
              aria-label="Enable Advanced Physics"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium">Advanced Physics</span>
          </label>
        </motion.div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Controls panel */}
        <motion.div
          className="w-full lg:w-1/3 space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Basic Parameters</h3>

            <SliderRow label="Angle (°)" value={angle} min={5} max={85} step={1} onChange={setAngle} unit="°" />
            <SliderRow label="Velocity (m/s)" value={speed} min={5} max={50} step={1} onChange={setSpeed} unit=" m/s" />
            <SliderRow
              label="Gravity (m/s²)"
              value={gravity}
              min={1}
              max={20}
              step={0.1}
              onChange={setGravity}
              unit=" m/s²"
            />
            <SliderRow
              label="Initial Height (m)"
              value={initialHeight}
              min={0}
              max={10}
              step={0.1}
              onChange={setInitialHeight}
              unit=" m"
            />
          </div>

          {/* Advanced sliders (collapsible) */}
          <AnimatePresence>
            {advancedOn && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Advanced Parameters</h3>

                <SliderRow label="Mass (kg)" value={mass} min={0.1} max={10} step={0.1} onChange={setMass} unit=" kg" />
                <SliderRow label="Drag Coefficient" value={Cd} min={0} max={1} step={0.01} onChange={setCd} />
                <SliderRow
                  label="Cross-section Area (m²)"
                  value={area}
                  min={0.001}
                  max={0.1}
                  step={0.001}
                  onChange={setArea}
                  unit=" m²"
                />
                <SliderRow
                  label="Wind Speed (m/s)"
                  value={wind}
                  min={-10}
                  max={10}
                  step={0.5}
                  onChange={setWind}
                  unit=" m/s"
                />
                <SliderRow
                  label="Air Resistance Factor"
                  value={airResistance}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={setAirResistance}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Launch and reset buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={handleLaunch}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={isLaunched}
              aria-label="Launch projectile"
            >
              Launch
            </motion.button>

            <motion.button
              onClick={handleReset}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={!isLaunched}
              aria-label="Reset simulation"
            >
              Reset
            </motion.button>
          </div>

          {/* XyReadout (only visible in basic mode) */}
          {!advancedOn && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <XyReadout ref={xyRef} />
            </motion.div>
          )}
        </motion.div>

        {/* Simulation container */}
        <motion.div
          className="w-full lg:w-2/3 flex flex-col gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Canvas container */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg overflow-x-auto">
            <ProjectileCanvas
              angle={angle}
              speed={speed}
              gravity={gravity}
              initialHeight={initialHeight}
              advanced={advancedOn}
              mass={mass}
              Cd={Cd}
              area={area}
              wind={wind}
              airResistance={airResistance}
              launchKey={launchKey}
              onFrame={updateVelocity}
              isLaunched={isLaunched}
              onComplete={() => setIsLaunched(false)}
            />
          </div>

          {/* Vector components visualization */}
          {!advancedOn && (
            <motion.div
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Velocity Components</h3>
              <VectorComponents
                angle={angle}
                speed={speed}
                currentVx={velocityRef.current.vx}
                currentVy={velocityRef.current.vy}
                isLaunched={isLaunched}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
