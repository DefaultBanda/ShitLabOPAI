import MagneticFieldsSimulator from "@/components/simulations/MagneticFieldsSimulator"

export const metadata = {
  title: "Magnetic Fields Simulator",
  description: "Interactive simulation of magnetic fields from bar magnets and electromagnets",
}

export default function MagneticFieldsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-[800px]">
        <MagneticFieldsSimulator />
      </div>
    </div>
  )
}
