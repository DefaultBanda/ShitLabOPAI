"use client"

import { motion } from "framer-motion"

interface PitStopPadProps {
  onTyreClick: (tyre: string) => void
  tyreSequence: string[]
  stuckWheel: string | null
}

export default function PitStopPad({ onTyreClick, tyreSequence, stuckWheel }: PitStopPadProps) {
  const tyres = [
    { id: "FL", label: "Front Left", position: "top-left" },
    { id: "FR", label: "Front Right", position: "top-right" },
    { id: "RL", label: "Rear Left", position: "bottom-left" },
    { id: "RR", label: "Rear Right", position: "bottom-right" },
  ]

  return (
    <div className="grid grid-cols-2 gap-6 max-w-xl mx-auto">
      {tyres.map((tyre) => (
        <motion.div
          key={tyre.id}
          className={`
            h-40 md:h-48 rounded-xl flex items-center justify-center cursor-pointer relative
            ${
              tyreSequence.includes(tyre.id)
                ? "bg-green-500 dark:bg-green-600 cursor-default"
                : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            }
            text-white font-bold text-lg
          `}
          whileHover={!tyreSequence.includes(tyre.id) ? { scale: 1.05 } : {}}
          whileTap={!tyreSequence.includes(tyre.id) ? { scale: 0.95 } : {}}
          animate={
            tyreSequence.includes(tyre.id)
              ? {
                  boxShadow: [
                    "0px 0px 0px rgba(0,255,0,0)",
                    "0px 0px 20px rgba(0,255,0,0.7)",
                    "0px 0px 0px rgba(0,255,0,0)",
                  ],
                }
              : {}
          }
          transition={{ duration: 0.5 }}
          onClick={() => !tyreSequence.includes(tyre.id) && onTyreClick(tyre.id)}
        >
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-1">{tyre.id}</span>
            <span className="text-sm">{tyre.label}</span>
          </div>

          {/* Tyre Gun Animation */}
          {tyreSequence.includes(tyre.id) && (
            <motion.div
              className="absolute -right-4 h-16 w-6 bg-gray-800 rounded-md origin-left"
              initial={{ rotate: 0 }}
              animate={{
                rotate: [0, 45, 0, -45, 0],
                x: [0, -5, 0, -5, 0],
              }}
              transition={{ duration: 0.3, times: [0, 0.25, 0.5, 0.75, 1] }}
            />
          )}

          {/* Stuck Wheel Indicator */}
          {stuckWheel === tyre.id && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-red-600 bg-opacity-70 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className="text-white text-xl font-bold">Stuck Wheel!</span>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
