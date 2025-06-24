import dynamic from "next/dynamic"

// disable SSR for Wave/Canvas heavy component
const SignalLab = dynamic(() => import("@/components/simulations/SignalLab"), {
  ssr: false,
})

export default function SignalLabPage() {
  return (
    <div className="min-h-screen p-4">
      <SignalLab />
    </div>
  )
}
