"use client"

import { useState } from "react"

export default function GradeCalculator() {
  // simple final exam calculator
  const [current, setCurrent] = useState(85)
  const [desired, setDesired] = useState(90)
  const [weight, setWeight] = useState(20) // percent
  const [finalScore, setFinalScore] = useState(80)

  const w = weight / 100
  const c = current / 100
  const d = desired / 100
  const fNeeded = w > 0 ? ((d - (1 - w) * c) / w) * 100 : NaN
  const finalGrade = ((1 - w) * c + w * (finalScore / 100)) * 100

  return (
    <div className="max-w-md mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-center mb-4">Final Grade Calculator</h2>

      <div className="space-y-3 p-4 border rounded bg-gray-50 dark:bg-gray-800">
        <h3 className="text-xl font-semibold">Grade Required on Final</h3>
        <label className="block text-sm">Current Grade (%)
          <input type="number" value={current} onChange={(e)=>setCurrent(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
        </label>
        <label className="block text-sm">Desired Overall Grade (%)
          <input type="number" value={desired} onChange={(e)=>setDesired(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
        </label>
        <label className="block text-sm">Final Exam Weight (%)
          <input type="number" value={weight} onChange={(e)=>setWeight(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
        </label>
        <div className="font-mono text-lg">Required Score: {isNaN(fNeeded) ? "N/A" : fNeeded.toFixed(2)}%</div>
      </div>

      <div className="space-y-3 p-4 border rounded bg-gray-50 dark:bg-gray-800">
        <h3 className="text-xl font-semibold">Overall Grade After Final</h3>
        <label className="block text-sm">Current Grade (%)
          <input type="number" value={current} onChange={(e)=>setCurrent(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
        </label>
        <label className="block text-sm">Final Exam Score (%)
          <input type="number" value={finalScore} onChange={(e)=>setFinalScore(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
        </label>
        <label className="block text-sm">Final Exam Weight (%)
          <input type="number" value={weight} onChange={(e)=>setWeight(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
        </label>
        <div className="font-mono text-lg">Overall Grade: {finalGrade.toFixed(2)}%</div>
      </div>
    </div>
  )
}

