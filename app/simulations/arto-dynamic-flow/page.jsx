"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sparkles, Wind, Gauge, Radar, Thermometer } from "lucide-react"

const presets = [
  {
    name: "Monza Trim",
    description: "Low drag, long DRS zones",
    speed: 330,
    flapAngle: 14,
    rideHeight: 22,
    airDensity: 1.18,
    wingArea: 1.55,
  },
  {
    name: "Baku Sprint",
    description: "DRS power lap",
    speed: 320,
    flapAngle: 18,
    rideHeight: 24,
    airDensity: 1.2,
    wingArea: 1.65,
  },
  {
    name: "Monaco Quali",
    description: "Maximum downforce",
    speed: 245,
    flapAngle: 32,
    rideHeight: 20,
    airDensity: 1.23,
    wingArea: 1.78,
  },
]

const flowBands = [
  { label: "Suction Peak", color: "from-rose-500/70 via-orange-400/60 to-yellow-300/60" },
  { label: "Boundary Layer", color: "from-cyan-500/70 via-blue-500/60 to-indigo-500/60" },
  { label: "Wake", color: "from-purple-500/70 via-fuchsia-500/60 to-pink-500/60" },
]

export default function ArtoDynamicFlowLab() {
  const [speed, setSpeed] = useState(300)
  const [flapAngle, setFlapAngle] = useState(20)
  const [rideHeight, setRideHeight] = useState(24)
  const [airDensity, setAirDensity] = useState(1.21)
  const [wingArea, setWingArea] = useState(1.65)
  const [drsOpen, setDrsOpen] = useState(true)
  const [slipstream, setSlipstream] = useState(false)

  const metrics = useMemo(() => {
    const speedMs = speed / 3.6
    const dynamicPressure = 0.5 * airDensity * speedMs * speedMs
    const baselineCd = 0.9 + rideHeight * 0.003
    const baselineCl = 2.45 + flapAngle * 0.035 - rideHeight * 0.01

    const drsFactor = drsOpen ? 0.78 : 1
    const slipstreamFactor = slipstream ? 0.93 : 1
    const wakePenalty = slipstream ? 0.04 : 0.08

    const effectiveCd = baselineCd * drsFactor * slipstreamFactor
    const effectiveCl = baselineCl * (drsOpen ? 0.92 : 1) * (1 - wakePenalty * Math.max(flapAngle / 40, 0))

    const dragForce = dynamicPressure * wingArea * effectiveCd
    const downforce = dynamicPressure * wingArea * effectiveCl
    const drsGainKph = drsOpen ? Math.max(8, (baselineCd - effectiveCd) * 48) : 0
    const balanceShift = (flapAngle - 18) * 0.18 + (drsOpen ? 1.6 : 0) - rideHeight * 0.04
    const flowStability = Math.max(0, Math.min(100, 82 + flapAngle * 0.4 - rideHeight * 0.9 - (slipstream ? 8 : 0)))

    return {
      speedMs,
      dynamicPressure,
      baselineCd,
      baselineCl,
      effectiveCd,
      effectiveCl,
      dragForce,
      downforce,
      drsGainKph,
      balanceShift,
      flowStability,
    }
  }, [airDensity, drsOpen, flapAngle, rideHeight, slipstream, speed, wingArea])

  const drsStatus = drsOpen ? "DRS DEPLOYED" : "DRS CLOSED"
  const flowNote = metrics.flowStability > 80 ? "Stable attachment" : metrics.flowStability > 65 ? "Marginal stall risk" : "Separation forming"

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,#38bdf8,transparent_25%),radial-gradient(circle_at_80%_10%,#f97316,transparent_25%),radial-gradient(circle_at_50%_70%,#a855f7,transparent_25%)]" aria-hidden />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:80px_80px]" aria-hidden />

      <div className="container relative mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.35em] text-cyan-200/80">
              <Sparkles className="h-5 w-5 text-orange-300" />
              Arto Dynamic Flow Lab
            </div>
            <h1 className="mt-2 text-4xl font-black leading-tight text-white md:text-6xl">
              F1 DRS Flap Aerodynamic Visualizer
            </h1>
            <p className="mt-3 max-w-2xl text-base text-slate-200/80 md:text-lg">
              Tune flap geometry, ride height, and DRS activation to see how aero balance, drag, and downforce evolve in real time. Designed for Arto flow experiments with vivid feedback, telemetry, and flow-band visuals.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Badge className="bg-orange-500/80 text-white hover:bg-orange-500">Track Aero Tools</Badge>
              <Badge variant="outline" className="border-cyan-500/70 bg-cyan-500/10 text-cyan-100">
                Live DRS Delta
              </Badge>
              <Badge variant="outline" className="border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-100">
                Flow Stability Map
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 px-5 py-4 shadow-lg shadow-cyan-900/40">
            <Wind className="h-10 w-10 text-cyan-300" />
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Mode</p>
              <p className="text-lg font-semibold text-white">{drsStatus}</p>
              <p className="text-sm text-cyan-200/80">+{metrics.drsGainKph.toFixed(1)} km/h top-speed delta</p>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-6">
            <Card className="border-slate-800/60 bg-white/5 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-xl text-white">Flow Controls</CardTitle>
                  <p className="text-sm text-slate-300/80">Dial in aero trim and observe live deltas.</p>
                </div>
                <div className="flex gap-2">
                  {presets.map((preset) => (
                    <Button
                      key={preset.name}
                      size="sm"
                      variant="outline"
                      className="border-slate-700 bg-slate-900/60 text-slate-50 hover:border-cyan-400 hover:text-white"
                      onClick={() => {
                        setSpeed(preset.speed)
                        setFlapAngle(preset.flapAngle)
                        setRideHeight(preset.rideHeight)
                        setAirDensity(preset.airDensity)
                        setWingArea(preset.wingArea)
                      }}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-5">
                  <ControlGroup
                    label="Car Speed"
                    value={`${speed.toFixed(0)} km/h`}
                    icon={<Gauge className="h-4 w-4 text-cyan-300" />}
                  >
                    <Slider value={[speed]} min={160} max={360} step={1} onValueChange={(v) => setSpeed(v[0])} />
                  </ControlGroup>
                  <ControlGroup
                    label="Flap Angle"
                    value={`${flapAngle.toFixed(1)}°`}
                    icon={<Sparkles className="h-4 w-4 text-orange-300" />}
                  >
                    <Slider value={[flapAngle]} min={0} max={40} step={0.5} onValueChange={(v) => setFlapAngle(v[0])} />
                  </ControlGroup>
                  <ControlGroup
                    label="Ride Height"
                    value={`${rideHeight.toFixed(0)} mm`}
                    icon={<Radar className="h-4 w-4 text-fuchsia-300" />}
                  >
                    <Slider value={[rideHeight]} min={10} max={60} step={1} onValueChange={(v) => setRideHeight(v[0])} />
                  </ControlGroup>
                </div>
                <div className="space-y-5">
                  <ControlGroup
                    label="Air Density"
                    value={`${airDensity.toFixed(2)} kg/m³`}
                    icon={<Thermometer className="h-4 w-4 text-emerald-300" />}
                  >
                    <Slider value={[airDensity]} min={1.08} max={1.28} step={0.01} onValueChange={(v) => setAirDensity(v[0])} />
                  </ControlGroup>
                  <ControlGroup
                    label="Wing Area"
                    value={`${wingArea.toFixed(2)} m²`}
                    icon={<Wind className="h-4 w-4 text-sky-300" />}
                  >
                    <Slider value={[wingArea]} min={1.4} max={1.9} step={0.01} onValueChange={(v) => setWingArea(v[0])} />
                  </ControlGroup>
                  <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">DRS Deployment</p>
                      <p className="text-xs text-slate-300/80">Toggle flap opening and slipstream effect</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-slate-200">
                        <Switch checked={slipstream} onCheckedChange={setSlipstream} />
                        Slipstream
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-200">
                        <Switch checked={drsOpen} onCheckedChange={setDrsOpen} />
                        DRS
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800/60 bg-white/5 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-xl text-white">Flow Visualization</CardTitle>
                  <p className="text-sm text-slate-300/80">Color bands show suction, boundary attachment, and wake energy.</p>
                </div>
                <Badge variant="outline" className="border-cyan-500/60 bg-cyan-500/10 text-cyan-100">
                  {flowNote}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_45%),radial-gradient(circle_at_70%_50%,rgba(34,211,238,0.15),transparent_42%)]" aria-hidden />
                  <div className="relative space-y-2">
                    {flowBands.map((band) => (
                      <div
                        key={band.label}
                        className={`h-16 w-full rounded-xl bg-gradient-to-r ${band.color} blur-[1px]`}
                      />
                    ))}
                  </div>
                  <div className="relative mt-4 grid gap-4 md:grid-cols-3">
                    <FlowStat label="Flow Stability" value={`${metrics.flowStability.toFixed(0)}%`} barValue={metrics.flowStability} />
                    <FlowStat label="Balance Shift" value={`${metrics.balanceShift.toFixed(1)}% forward`} barValue={Math.max(0, Math.min(100, 50 + metrics.balanceShift))} />
                    <FlowStat label="DRS Delta" value={`+${metrics.drsGainKph.toFixed(1)} km/h`} barValue={Math.min(100, (metrics.drsGainKph / 20) * 100)} />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <DataTile title="Effective Cl" value={metrics.effectiveCl.toFixed(2)} accent="bg-cyan-500/20" />
                  <DataTile title="Effective Cd" value={metrics.effectiveCd.toFixed(3)} accent="bg-orange-500/20" />
                  <DataTile title="Dynamic Pressure" value={`${metrics.dynamicPressure.toFixed(1)} Pa`} accent="bg-fuchsia-500/20" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6">
            <Card className="border-slate-800/60 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 shadow-xl shadow-cyan-900/40">
              <CardHeader>
                <CardTitle className="text-xl text-white">Live Telemetry</CardTitle>
                <p className="text-sm text-slate-300/80">Real-time aero loads and speed deltas for Arto runs.</p>
              </CardHeader>
              <CardContent className="space-y-5">
                <TelemetryRow label="Downforce" value={`${metrics.downforce.toFixed(0)} N`} hint="Normal load on rear axle" />
                <TelemetryRow label="Drag" value={`${metrics.dragForce.toFixed(0)} N`} hint="Longitudinal resistance" />
                <TelemetryRow label="Speed Gain" value={`+${metrics.drsGainKph.toFixed(1)} km/h`} hint="DRS-assisted top speed" />
                <TelemetryRow label="Aero Balance" value={`${metrics.balanceShift.toFixed(1)}% fwd`} hint="Positive = front biased" />
                <TelemetryRow label="Flow Stability" value={`${metrics.flowStability.toFixed(0)}%`} hint="Attachment under current yaw" />
              </CardContent>
            </Card>

            <Card className="border-slate-800/60 bg-white/5 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl text-white">Flow Lab Notes</CardTitle>
                <p className="text-sm text-slate-300/80">Quick guidance for DRS and flap exploration.</p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-200/90">
                <NoteRow title="DRS Stability" body="Keep flap angle under 22° with DRS open to avoid wake-induced separation on corner exits." />
                <NoteRow title="Brake Stability" body="Raising ride height by 6-10 mm trims balance rearward for heavy stops like Turn 1." />
                <NoteRow title="Slipstream Runs" body="Activate slipstream toggle to simulate 7-10% drag cut and slight stability loss behind another car." />
                <NoteRow title="Quali Push" body="Pair 30° flap with low ride height for max downforce; watch stability meter for stall cues." />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function ControlGroup({ label, value, icon, children }) {
  return (
    <div className="space-y-2 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 shadow-inner shadow-slate-950/40">
      <div className="flex items-center justify-between text-sm text-slate-200">
        <div className="flex items-center gap-2 font-semibold text-white">
          {icon}
          {label}
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-mono text-cyan-100/90">{value}</span>
      </div>
      {children}
    </div>
  )
}

function FlowStat({ label, value, barValue }) {
  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
      <div className="flex items-center justify-between text-xs text-slate-300/80">
        <span>{label}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="rounded bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-cyan-100">
              Detail
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs text-slate-200">
              Values react to flap angle, DRS state, and ride height. Higher means more stability or gain.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="mt-1 flex items-baseline justify-between">
        <p className="text-lg font-semibold text-white">{value}</p>
      </div>
      <Progress value={barValue} className="mt-2 h-2 bg-slate-800" />
    </div>
  )
}

function DataTile({ title, value, accent }) {
  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <div className={`mt-3 h-1.5 w-full rounded-full ${accent}`} />
    </div>
  )
}

function TelemetryRow({ label, value, hint }) {
  return (
    <div className="flex items-start justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs text-slate-300/80">{hint}</p>
      </div>
      <p className="text-lg font-mono text-cyan-100">{value}</p>
    </div>
  )
}

function NoteRow({ title, body }) {
  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 px-3 py-3">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-xs text-slate-300/80">{body}</p>
    </div>
  )
}
