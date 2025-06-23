import F1Stats from "@/components/simulations/F1Stats"

export const metadata = {
  title: "F1 Stats",
  description: "Race results and upcoming events using OpenF1 data",
}

export default function F1StatsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <F1Stats />
    </div>
  )
}

