"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

export default function GradeCalculator() {
  const [mode, setMode] = useState("final-required")

  // simple final exam calculator
  const [current, setCurrent] = useState(85)
  const [desired, setDesired] = useState(90)
  const [weight, setWeight] = useState(20) // percent
  const [finalScore, setFinalScore] = useState(80)

  // final counts as a test
  const [testCurrent, setTestCurrent] = useState(85)
  const [testDesired, setTestDesired] = useState(90)
  const [testWeight, setTestWeight] = useState(30)
  const [testCount, setTestCount] = useState(5)
  const [testAverage, setTestAverage] = useState(80)
  const [testUnits, setTestUnits] = useState(1)

  // multi-part final
  const [multiCurrent, setMultiCurrent] = useState(85)
  const [multiDesired, setMultiDesired] = useState(90)
  const [multiWeight, setMultiWeight] = useState(20)
  const [multiTotalPts, setMultiTotalPts] = useState(100)
  const [multiGradedPts, setMultiGradedPts] = useState(50)
  const [multiScoredPts, setMultiScoredPts] = useState(45)

  // point weight
  const [pointsTotal, setPointsTotal] = useState(1000)
  const [pointsFinal, setPointsFinal] = useState(200)

  // dropped tests
  const [dropCurrent, setDropCurrent] = useState(85)
  const [dropDesired, setDropDesired] = useState(90)
  const [dropWT, setDropWT] = useState(30)
  const [dropNT, setDropNT] = useState(5)
  const [dropND, setDropND] = useState(1)
  const [dropCT, setDropCT] = useState(80)
  const [dropLowest, setDropLowest] = useState('70')
  const [dropNF, setDropNF] = useState(1)
  const [dropWF, setDropWF] = useState(10)

  const w = weight / 100
  const c = current / 100
  const d = desired / 100
  const fNeeded = w > 0 ? ((d - (1 - w) * c) / w) * 100 : NaN
  const finalGrade = ((1 - w) * c + w * (finalScore / 100)) * 100

  const computeGraphData = () => {
    const data = []
    for (let i = 0; i <= 20; i++) {
      const score = i * 5
      let grade
      switch (mode) {
        case "final-test": {
          const tau = tw === 1 ? 0 : (tc - tw * ta) / (1 - tw)
          grade =
            ((1 - tw) * tau +
              tw * ((ta * testCount + (score / 100) * testUnits) / (testCount + testUnits))) *
            100
          break
        }
        case "multi-part": {
          const part = (1 - mw) * mc + mw * ((1 - W) * C + W * (score / 100))
          grade = part * 100
          break
        }
        case "weight-points": {
          const wp = pointsFinal / pointsTotal
          grade = ((1 - wp) * c + wp * (score / 100)) * 100
          break
        }
        case "dropped-tests": {
          grade = (nonDropped + nonTest + (score / 100) * totalW) * 100
          break
        }
        default: {
          grade = ((1 - w) * c + w * (score / 100)) * 100
        }
      }
      data.push({ score, grade })
    }
    return data
  }

  // final counts as a test
  const tw = testWeight / 100
  const tc = testCurrent / 100
  const td = testDesired / 100
  const ta = testAverage / 100
  let testNeeded
  if (tw === 1) {
    testNeeded = ((td * (testCount + testUnits) - ta * testCount) / testUnits) * 100
  } else {
    const tau = (tc - tw * ta) / (1 - tw)
    testNeeded =
      ((td - (1 - tw) * tau) * (testCount + testUnits) - tw * ta * testCount) /
      (tw * testUnits) *
      100
  }

  // multi-part final exam
  const mw = multiWeight / 100
  const mc = multiCurrent / 100
  const md = multiDesired / 100
  const W = 1 - multiGradedPts / multiTotalPts
  const C = multiGradedPts > 0 ? multiScoredPts / multiGradedPts : 0
  const multiNeeded =
    mw === 0 || W === 0
      ? NaN
      : ((md - (1 - mw) * mc) / mw - ((1 - W) * C) / W) * 100

  // weight from points
  const weightFromPoints = (pointsFinal / pointsTotal) * 100

  // dropped tests
  const dwt = dropWT / 100
  const dwf = dropWF / 100
  const dc = dropCurrent / 100
  const dd = dropDesired / 100
  const dct = dropCT / 100
  const dropScores = dropLowest
    .split(/[,\s]+/)
    .map((s) => parseFloat(s || "0") / 100)
    .filter((n) => !isNaN(n))
    .slice(0, dropND)
  const sumDrop = dropScores.reduce((a, b) => a + b, 0)
  const nonDropped = ((dropNT * dct - sumDrop) * dwt) / (dropNT - dropND + dropNF)
  const nonTest = dc * (1 - dwf) - dct * dwt
  const totalW = dwf + (dwt * dropNF) / (dropNT - dropND + dropNF)
  const dropNeeded =
    totalW > 0
      ? ((dd - nonDropped - nonTest) / totalW) * 100
      : NaN

  const finalGraphData = computeGraphData()

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-center mb-4">Final Grade Calculator</h2>

      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="w-full p-2 border rounded bg-background"
      >
        <option value="final-required">Grade Required on Final</option>
        <option value="overall-after">Overall Grade After Final</option>
        <option value="final-test">Final Counts as a Test</option>
        <option value="multi-part">Multi-part Final Average</option>
        <option value="weight-points">Weight of Final from Points</option>
        <option value="dropped-tests">Final Exam with Dropped Tests</option>
      </select>

      {mode === "final-required" && (
        <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800 md:flex gap-6">
          <div className="space-y-3 md:w-1/2">
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
          <div className="md:w-1/2">
            <LineChart width={400} height={250} data={finalGraphData} className="mx-auto">
              <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
              <XAxis dataKey="score" label={{ value: "Final Score (%)", position: "insideBottom", dy: 10 }} />
              <YAxis label={{ value: "Overall Grade (%)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Line type="monotone" dataKey="grade" stroke="#16a34a" />
            </LineChart>
          </div>
        </div>
      )}
      {mode === "overall-after" && (
        <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800 md:flex gap-6">
          <div className="space-y-3 md:w-1/2">
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
          <div className="md:w-1/2">
            <LineChart width={400} height={250} data={finalGraphData} className="mx-auto">
              <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
              <XAxis dataKey="score" label={{ value: "Final Score (%)", position: "insideBottom", dy: 10 }} />
              <YAxis label={{ value: "Overall Grade (%)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Line type="monotone" dataKey="grade" stroke="#16a34a" />
            </LineChart>
          </div>
        </div>
      )}
      {mode === "final-test" && (
        <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800 md:flex gap-6">
          <div className="space-y-3 md:w-1/2">
            <h3 className="text-xl font-semibold">Final Counts as a Test</h3>
            <label className="block text-sm">Current Grade (%)
              <input type="number" value={testCurrent} onChange={(e)=>setTestCurrent(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
            </label>
            <label className="block text-sm">Desired Overall Grade (%)
              <input type="number" value={testDesired} onChange={(e)=>setTestDesired(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
            </label>
            <label className="block text-sm">Test Category Weight (%)
              <input type="number" value={testWeight} onChange={(e)=>setTestWeight(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
            </label>
            <label className="block text-sm">Number of Tests Taken
              <input type="number" value={testCount} onChange={(e)=>setTestCount(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
            </label>
            <label className="block text-sm">Average Test Score (%)
              <input type="number" value={testAverage} onChange={(e)=>setTestAverage(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
            </label>
            <label className="block text-sm">Final Test Weight (units)
              <input type="number" value={testUnits} onChange={(e)=>setTestUnits(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
            </label>
            <div className="font-mono text-lg">Required Score: {isNaN(testNeeded) ? "N/A" : testNeeded.toFixed(2)}%</div>
          </div>
          <div className="md:w-1/2">
            <LineChart width={400} height={250} data={finalGraphData} className="mx-auto">
              <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
              <XAxis dataKey="score" label={{ value: "Final Score (%)", position: "insideBottom", dy: 10 }} />
              <YAxis label={{ value: "Overall Grade (%)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Line type="monotone" dataKey="grade" stroke="#16a34a" />
            </LineChart>
          </div>
        </div>
      )}
      {mode === "multi-part" && (
        <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800 md:flex gap-6">
          <div className="space-y-3 md:w-1/2">
            <h3 className="text-xl font-semibold">Multi-part Final Average</h3>
            <label className="block text-sm">Current Grade (%)
              <input type="number" value={multiCurrent} onChange={(e)=>setMultiCurrent(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
            </label>
            <label className="block text-sm">Desired Overall Grade (%)
              <input type="number" value={multiDesired} onChange={(e)=>setMultiDesired(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
            </label>
            <label className="block text-sm">Final Weight (%)
              <input type="number" value={multiWeight} onChange={(e)=>setMultiWeight(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
            </label>
            <label className="block text-sm">Total Points on Final
              <input type="number" value={multiTotalPts} onChange={(e)=>setMultiTotalPts(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
            </label>
            <label className="block text-sm">Points of Parts Graded
              <input type="number" value={multiGradedPts} onChange={(e)=>setMultiGradedPts(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
            </label>
            <label className="block text-sm">Points Scored on Graded Parts
              <input type="number" value={multiScoredPts} onChange={(e)=>setMultiScoredPts(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
            </label>
            <div className="font-mono text-lg">Required Avg on Remaining Parts: {isNaN(multiNeeded) ? "N/A" : multiNeeded.toFixed(2)}%</div>
          </div>
          <div className="md:w-1/2">
            <LineChart width={400} height={250} data={finalGraphData} className="mx-auto">
              <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
              <XAxis dataKey="score" label={{ value: "Final Score (%)", position: "insideBottom", dy: 10 }} />
              <YAxis label={{ value: "Overall Grade (%)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Line type="monotone" dataKey="grade" stroke="#16a34a" />
            </LineChart>
          </div>
        </div>
      )}
      {mode === "weight-points" && (
        <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800 md:flex gap-6">
          <div className="space-y-3 md:w-1/2">
            <h3 className="text-xl font-semibold">Weight of Final from Points</h3>
            <label className="block text-sm">Total Points Including Final
              <input type="number" value={pointsTotal} onChange={(e)=>setPointsTotal(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
            </label>
            <label className="block text-sm">Final Exam Points
              <input type="number" value={pointsFinal} onChange={(e)=>setPointsFinal(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
            </label>
            <div className="font-mono text-lg">Final Weight: {isNaN(weightFromPoints) ? "N/A" : weightFromPoints.toFixed(2)}%</div>
          </div>
          <div className="md:w-1/2">
            <LineChart width={400} height={250} data={finalGraphData} className="mx-auto">
              <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
              <XAxis dataKey="score" label={{ value: "Final Score (%)", position: "insideBottom", dy: 10 }} />
              <YAxis label={{ value: "Overall Grade (%)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Line type="monotone" dataKey="grade" stroke="#16a34a" />
            </LineChart>
          </div>
        </div>
      )}
      {mode === "dropped-tests" && (
        <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800 md:flex gap-6">
          <div className="space-y-3 md:w-1/2">
            <h3 className="text-xl font-semibold">Final Exam with Dropped Tests</h3>
            <label className="block text-sm">Current Grade (%)
              <input type="number" value={dropCurrent} onChange={(e)=>setDropCurrent(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
            </label>
            <label className="block text-sm">Desired Overall Grade (%)
              <input type="number" value={dropDesired} onChange={(e)=>setDropDesired(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
            </label>
            <label className="block text-sm">Test Category Weight (%)
              <input type="number" value={dropWT} onChange={(e)=>setDropWT(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
            </label>
            <label className="block text-sm">Total Tests
              <input type="number" value={dropNT} onChange={(e)=>setDropNT(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
            </label>
            <label className="block text-sm">Lowest Tests Dropped
              <input type="number" value={dropND} onChange={(e)=>setDropND(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
            </label>
            <label className="block text-sm">Average Test Score (%)
              <input type="number" value={dropCT} onChange={(e)=>setDropCT(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
            </label>
            <label className="block text-sm">Lowest Scores (comma separated %)
              <input type="text" value={dropLowest} onChange={(e)=>setDropLowest(e.target.value)} className="mt-1 w-full p-2 border rounded bg-background" />
            </label>
            <label className="block text-sm">Final Test Units
              <input type="number" value={dropNF} onChange={(e)=>setDropNF(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
            </label>
            <label className="block text-sm">Final Exam Weight (%)
              <input type="number" value={dropWF} onChange={(e)=>setDropWF(parseFloat(e.target.value))} className="mt-1 w-full p-2 border rounded bg-background" />
            </label>
            <div className="font-mono text-lg">Required Final Score: {isNaN(dropNeeded) ? "N/A" : dropNeeded.toFixed(2)}%</div>
          </div>
          <div className="md:w-1/2">
            <LineChart width={400} height={250} data={finalGraphData} className="mx-auto">
              <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
              <XAxis dataKey="score" label={{ value: "Final Score (%)", position: "insideBottom", dy: 10 }} />
              <YAxis label={{ value: "Overall Grade (%)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Line type="monotone" dataKey="grade" stroke="#16a34a" />
            </LineChart>
          </div>
        </div>
      )}
      <p className="text-center italic text-sm mt-8">"Education is not the filling of a pail, but the lighting of a fire." – William Butler Yeats</p>
    </div>
  )
}

