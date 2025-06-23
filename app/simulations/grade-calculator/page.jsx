import GradeCalculator from "@/components/simulations/GradeCalculator"

export const metadata = {
  title: "Final Grade Calculator",
  description: "Calculate required exam scores and final grades",
}

export default function GradeCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <GradeCalculator />
    </div>
  )
}
