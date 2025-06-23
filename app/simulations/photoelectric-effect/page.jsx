import PhotoelectricEffect from "@/components/simulations/PhotoelectricEffect"

export const metadata = {
  title: "Photoelectric Effect Simulation",
  description: "Interactive visualization of the photoelectric effect",
}

export default function PhotoelectricEffectPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PhotoelectricEffect />
    </div>
  )
}
