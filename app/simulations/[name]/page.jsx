"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import ProjectileMotion from "@/components/simulations/ProjectileMotion"
import BouncingBall from "@/components/simulations/BouncingBall"
import Pendulum from "@/components/simulations/Pendulum"
import WallBreakEscape from "@/components/simulations/WallBreakEscape"
import MomentumClash from "@/components/simulations/MomentumClash"
import SpendElonsMoney from "@/app/spend-elon/page"
import SignalLabSimulator from "@/components/simulations/SignalLabSimulator"

// Dynamically import WaveSimulator with SSR disabled
// This prevents hydration errors with Three.js components
const WaveSimulator = dynamic(() => import("@/components/simulations/WaveSimulator"), {
  ssr: false,
})

export default function SimulationPage({ params }) {
  const router = useRouter()
  const { name } = params

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)
  }, [])

  // Render the appropriate simulation based on the route parameter
  const renderSimulation = () => {
    switch (name) {
      case "projectile":
        return <ProjectileMotion />
      case "bouncing":
        return <BouncingBall />
      case "pendulum":
        return <Pendulum />
      case "waves":
        return <WaveSimulator />
      case "wall-break-escape":
        return <WallBreakEscape />
      case "momentum-clash":
        return <MomentumClash />
      case "signal-lab":
        return <SignalLabSimulator />
      case "spend-elon":
        return <SpendElonsMoney />
      default:
        // Redirect to home if simulation not found
        router.push("/")
        return null
    }
  }

  return <div className="min-h-screen">{renderSimulation()}</div>
}
