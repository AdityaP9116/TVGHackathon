"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MetricCard } from "@/components/metric-card"
import { Zap, Battery, TrendingUp, DollarSign, AlertTriangle } from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import type { ChartDataPoint, SheddingDataPoint, MetricData } from "@/lib/mock-data"

interface VisualTabsProps {
  forecastData: ChartDataPoint[]
  sheddingData: SheddingDataPoint[]
  metrics: MetricData | null
  hasResults: boolean
}

function ChartTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload) return null
  return (
    <div className="rounded-lg border border-border/60 bg-[#1a1b2e] px-3 py-2 shadow-xl">
      <p className="text-xs font-mono text-muted-foreground mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono text-foreground">{entry.value.toLocaleString()} MW</span>
        </div>
      ))}
    </div>
  )
}

export function VisualTabs({ forecastData, sheddingData, metrics, hasResults }: VisualTabsProps) {
  return (
    <Card className="border-border/50 bg-card flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium text-foreground">Model Visuals</CardTitle>
          <Badge className="bg-tn-green/15 text-tn-green border-tn-green/30 text-[10px] px-1.5 py-0">
            Live Demo
          </Badge>
        </div>
        <CardAction>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-tn-blue" />Baseline</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-tn-purple" />AI Load</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-tn-cyan" />Throttled</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-tn-orange/60" />Grid Cap</span>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <Tabs defaultValue="forecast" className="flex-1 flex flex-col">
          <TabsList className="bg-secondary/50 border border-border/30 w-fit">
            <TabsTrigger value="forecast" className="text-xs data-[state=active]:bg-tn-blue/15 data-[state=active]:text-tn-blue">
              Forecast
            </TabsTrigger>
            <TabsTrigger value="shedding" className="text-xs data-[state=active]:bg-tn-cyan/15 data-[state=active]:text-tn-cyan">
              Load-Shedding
            </TabsTrigger>
            <TabsTrigger value="stress" className="text-xs data-[state=active]:bg-tn-red/15 data-[state=active]:text-tn-red">
              Grid Stress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="forecast" className="flex-1 mt-3">
            {hasResults ? (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2f3052" strokeOpacity={0.5} />
                    <XAxis
                      dataKey="time"
                      stroke="#565f89"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      interval={3}
                    />
                    <YAxis
                      stroke="#565f89"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}`}
                      label={{ value: "MW", position: "insideLeft", offset: 10, style: { fill: "#565f89", fontSize: 10 } }}
                    />
                    <Tooltip content={<ChartTooltipContent />} />
                    <ReferenceLine y={4800} stroke="#e0af68" strokeDasharray="6 4" strokeOpacity={0.6} label={{ value: "Grid Cap", position: "insideTopRight", style: { fill: "#e0af68", fontSize: 10, opacity: 0.8 } }} />
                    <Line type="monotone" dataKey="baseline" stroke="#7aa2f7" strokeWidth={2} dot={false} name="Baseline" />
                    <Line type="monotone" dataKey="aiLoad" stroke="#bb9af7" strokeWidth={2} dot={false} name="AI Load" />
                    <Line type="monotone" dataKey="throttled" stroke="#2ac3de" strokeWidth={2} dot={false} name="Throttled" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-border/40 bg-secondary/20">
                <p className="text-sm text-muted-foreground/60">Run the demo to see forecast visuals</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="shedding" className="flex-1 mt-3">
            {hasResults ? (
              <div className="relative">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sheddingData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="shedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2ac3de" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#2ac3de" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2f3052" strokeOpacity={0.5} />
                      <XAxis dataKey="time" stroke="#565f89" fontSize={10} tickLine={false} axisLine={false} interval={3} />
                      <YAxis stroke="#565f89" fontSize={10} tickLine={false} axisLine={false} label={{ value: "MW", position: "insideLeft", offset: 10, style: { fill: "#565f89", fontSize: 10 } }} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="shedAmount" stroke="#2ac3de" fill="url(#shedGradient)" strokeWidth={2} name="Shed Amount" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="absolute top-3 right-3 rounded-md border border-tn-cyan/30 bg-tn-cyan/10 px-2 py-1">
                  <p className="text-[10px] font-mono text-tn-cyan">Total shed: 1,247 MWh (demo)</p>
                </div>
              </div>
            ) : (
              <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-border/40 bg-secondary/20">
                <p className="text-sm text-muted-foreground/60">Run the demo to see shedding data</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stress" className="flex-1 mt-3">
            {hasResults ? (
              <div className="flex flex-col gap-6 py-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Predicted Peak Utilization</span>
                    <span className="text-2xl font-mono font-bold text-tn-orange">92%</span>
                  </div>
                  <Progress value={92} className="h-3 bg-secondary/50 [&>div]:bg-gradient-to-r [&>div]:from-tn-orange [&>div]:to-tn-red" />
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-tn-red" />
                  <span className="text-sm text-muted-foreground">Risk Level:</span>
                  <Badge className="bg-tn-red/15 text-tn-red border-tn-red/30 text-xs">High</Badge>
                </div>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData.slice(0, 12)} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <XAxis dataKey="time" stroke="#565f89" fontSize={9} tickLine={false} axisLine={false} interval={2} />
                      <YAxis stroke="#565f89" fontSize={9} tickLine={false} axisLine={false} />
                      <Line type="monotone" dataKey="aiLoad" stroke="#f7768e" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-border/40 bg-secondary/20">
                <p className="text-sm text-muted-foreground/60">Run the demo to see stress analysis</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Run Summary Metrics */}
        {hasResults && metrics && (
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <MetricCard
              icon={<Zap className="size-3.5 text-tn-blue" />}
              label="Peak Load"
              value={metrics.peakLoad.toLocaleString()}
              unit="MW"
            />
            <MetricCard
              icon={<Battery className="size-3.5 text-tn-cyan" />}
              label="Shed Energy"
              value={metrics.shedEnergy.toLocaleString()}
              unit="MWh"
            />
            <MetricCard
              icon={<TrendingUp className="size-3.5 text-tn-green" />}
              label="Stability Gain"
              value={`+${metrics.stabilityGain}`}
              unit="%"
            />
            <MetricCard
              icon={<DollarSign className="size-3.5 text-tn-orange" />}
              label="Cost Impact"
              value={`$${(metrics.costImpact / 1000).toFixed(1)}k`}
              unit="saved"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
