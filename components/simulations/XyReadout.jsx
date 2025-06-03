"use client"

import React from "react"
import { useState, forwardRef, useImperativeHandle } from "react"
import { motion } from "framer-motion"

const XyReadout = forwardRef((props, ref) => {
  const [state, setState] = useState({
    vxInitial: 0,
    vyInitial: 0,
    vxLive: 0,
    vyLive: 0,
    running: false,
  })

  // Expose update method to parent component
  useImperativeHandle(ref, () => ({
    update: (vx, vy) => {
      setState((prev) => {
        // If values haven't changed significantly, don't update state
        if (prev.running && Math.abs(prev.vxLive - vx) < 0.1 && Math.abs(prev.vyLive - vy) < 0.1) {
          return prev
        }

        // If not running, set initial values
        if (!prev.running) {
          return {
            vxInitial: vx,
            vyInitial: vy,
            vxLive: vx,
            vyLive: vy,
            running: true,
          }
        }

        // If already running, update live values
        return {
          ...prev,
          vxLive: vx,
          vyLive: vy,
        }
      })
    },
  }))

  // Format velocity to 1 decimal place
  const formatVelocity = (v) => {
    return Math.abs(v) < 0.1 ? "0.0" : v.toFixed(1)
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 font-mono text-sm shadow-inner">
      <div className="text-gray-500 dark:text-gray-400 mb-2">Velocity Components</div>

      {!state.running ? (
        <div className="grid grid-cols-2 gap-2">
          <motion.div className="flex items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span>Vx₀ = 0.0 m/s</span>
          </motion.div>

          <motion.div
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-3 h-3 rounded-full bg-cyan-500 mr-2"></div>
            <span>Vy₀ = 0.0 m/s</span>
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <motion.div
            key={`vx-${state.vxLive}`}
            className="flex items-center"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span>Vx = {formatVelocity(state.vxLive)} m/s</span>
          </motion.div>

          <motion.div
            key={`vy-${state.vyLive}`}
            className="flex items-center"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-3 h-3 rounded-full bg-cyan-500 mr-2"></div>
            <span>Vy = {formatVelocity(state.vyLive)} m/s</span>
          </motion.div>
        </div>
      )}
    </div>
  )
})

XyReadout.displayName = "XyReadout"

export default React.memo(XyReadout)
