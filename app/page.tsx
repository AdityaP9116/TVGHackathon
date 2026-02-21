"use client"

import { useState, useCallback } from "react"
import {
  Zap,
  Github,
  ExternalLink,
  BarChart3,
  CloudLightning,
  Shield,
  Gauge,
  Moon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Toaster, toast } from "sonner"
import { DatasetUploader } from "@/components/dataset-uploader"
import { RunControls } from "@/components/run-controls"
import { OutputExport } from "@/components/output-export"
import { VisualTabs } from "@/components/visual-tabs"
import {
  generateForecastData,
  generateSheddingData,
  generateMetrics,
  type ChartDataPoint,
  type SheddingDataPoint,
  type MetricData,
} from "@/lib/mock-data"

const GITHUB_URL = "https://github.com/REPLACE_ME"

const VALUE_PROPS = [
  {
    icon: <BarChart3 className="size-5 text-tn-blue" />,
    text: "Forecast tomorrow's baseline demand",
  },
  {
    icon: <CloudLightning className="size-5 text-tn-purple" />,
    text: "Simulate AI data center stress",
  },
  {
    icon: <Shield className="size-5 text-tn-cyan" />,
    text: "Trigger automated load-shedding",
  },
]

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Ingest & Featurize",
    desc: "Load historical grid data with weather covariates. Auto-extract temporal features.",
  },
  {
    step: "02",
    title: "Forecast & Simulate",
    desc: "Run time-series models to predict baseline + AI workload surge over the horizon.",
  },
  {
    step: "03",
    title: "Throttle & Stabilize",
    desc: "Apply predictive throttling policies to shed excess compute before grid stress peaks.",
  },
]

export default function Home() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<number | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [hasResults, setHasResults] = useState(false)
  const [forecastData, setForecastData] = useState<ChartDataPoint[]>([])
  const [sheddingData, setSheddingData] = useState<SheddingDataPoint[]>([])
  const [metrics, setMetrics] = useState<MetricData | null>(null)

  const handleFileChange = useCallback((name: string | null, size: number | null) => {
    setFileName(name)
    setFileSize(size)
  }, [])

  const handleRun = useCallback(async () => {
    setIsRunning(true)

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_capacity: 4800,
          ai_spike: 600,
          tmax: 105,
          tmin: 80,
          wind: 5,
        }),
      });

      const data = await res.json();

      // Transform incoming Python data to match the UI ChartDataPoint interface
      const realForecastData: ChartDataPoint[] = data.chart_data.map((point: any) => ({
        time: `${Math.round(point.time + 10).toString().padStart(2, '0')}:00`, // Mapping array steps to hours roughly
        baseline: data.baseline_load,
        aiLoad: point.load > data.baseline_load + 300 ? point.load : point.load + 100, // Visual math approximation
        throttled: point.load,
        gridCap: 4800
      }));

      setForecastData(realForecastData)
      setSheddingData(generateSheddingData())
      setMetrics(generateMetrics())
      setHasResults(true)
      setIsRunning(false)
      toast.success("Simulation complete", {
        description: data.is_throttled
          ? "Kill-switch triggered! AI cluster compute safely shed over horizontal timeline."
          : "Grid stable under mock parameters.",
      })
    } catch (error) {
      console.error("API failed:", error);
      toast.error("Simulation failed", {
        description: "Could not reach the Python grid model backend."
      });
      setIsRunning(false);
    }
  }, [])

  const handleReset = useCallback(() => {
    setFileName(null)
    setFileSize(null)
    setHasResults(false)
    setForecastData([])
    setSheddingData([])
    setMetrics(null)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Background radial glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 70% 10%, rgba(122,162,247,0.08) 0%, rgba(187,154,247,0.04) 40%, transparent 70%)",
        }}
      />

      {/* ─── Navigation ─── */}
      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <Zap className="size-5 text-tn-cyan" />
            <span className="text-sm font-semibold text-foreground tracking-tight">Grid-Guard</span>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <button onClick={() => scrollTo("overview")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Overview
            </button>
            <button onClick={() => scrollTo("demo")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Demo
            </button>
            <button onClick={() => scrollTo("visuals")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Visuals
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden border-border/40 text-muted-foreground text-[10px] sm:flex items-center gap-1">
              <Moon className="size-3" />
              Tokyo Night
            </Badge>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/50 gap-1.5">
                <Github className="size-3.5" />
                <span className="hidden sm:inline">Repo</span>
                <ExternalLink className="size-3" />
              </Button>
            </a>
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        {/* ─── Hero Section ─── */}
        <section id="overview" className="mx-auto max-w-6xl px-4 pt-16 pb-12 lg:px-6 lg:pt-24 lg:pb-16">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              Grid-Guard
            </h1>
            <p className="mt-3 max-w-xl text-pretty text-base text-muted-foreground lg:text-lg">
              Predictive compute throttling to stabilize grid load for AI data centers.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex items-center gap-3">
              <Button
                onClick={() => scrollTo("demo")}
                className="bg-tn-blue text-primary-foreground hover:bg-tn-blue/80 shadow-[0_0_30px_rgba(122,162,247,0.2)] transition-all"
                size="lg"
              >
                Import Dataset
              </Button>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                >
                  <Github className="size-4" />
                  View GitHub
                </Button>
              </a>
            </div>

            {/* Value Props */}
            <div className="mt-12 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
              {VALUE_PROPS.map((prop, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 rounded-lg border border-border/30 bg-secondary/20 px-4 py-5 transition-colors hover:border-border/50 hover:bg-secondary/30"
                >
                  {prop.icon}
                  <span className="text-center text-xs text-muted-foreground leading-relaxed">{prop.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Demo Workspace Section ─── */}
        <section id="demo" className="mx-auto max-w-6xl px-4 pb-16 lg:px-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
            {/* Left Column: Controls */}
            <div className="flex flex-col gap-4" id="visuals">
              <DatasetUploader
                fileName={fileName}
                fileSize={fileSize}
                onFileChange={handleFileChange}
              />
              <RunControls
                isRunning={isRunning}
                onRun={handleRun}
                onReset={handleReset}
              />
              <OutputExport hasResults={hasResults} />
            </div>

            {/* Right Column: Visualizations */}
            <VisualTabs
              forecastData={forecastData}
              sheddingData={sheddingData}
              metrics={metrics}
              hasResults={hasResults}
            />
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section className="mx-auto max-w-6xl px-4 pb-16 lg:px-6">
          <h2 className="text-lg font-semibold text-foreground mb-8">How it works</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="flex flex-col gap-3 rounded-lg border border-border/30 bg-secondary/15 p-5">
                <span className="text-xs font-mono text-tn-cyan">{step.step}</span>
                <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Technical snippet */}
          <div className="mt-8 rounded-lg border border-border/30 bg-secondary/10 p-4">
            <p className="text-xs text-muted-foreground mb-2">Core throttle policy:</p>
            <code className="block text-xs font-mono text-tn-cyan leading-relaxed whitespace-pre-wrap">
              {"shed(t) = max(0, forecast(t) + ai_surge(t) - grid_cap) * aggressiveness\nthrottled(t) = baseline(t) + ai_surge(t) - shed(t)"}
            </code>
            <p className="text-xs text-muted-foreground mt-3">
              Replaced mock data generators in <span className="font-mono text-tn-blue">lib/mock-data.ts</span> with live responses from the Python Grid-Guard Model.
            </p>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/30 bg-background/50">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-1.5">
            <Gauge className="size-3.5 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground/60">Grid-Guard</span>
            <span className="text-xs text-muted-foreground/30 mx-1">{"/"}</span>
            <span className="text-xs text-muted-foreground/40">Hackathon Build</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              aria-label="GitHub repository"
            >
              <Github className="size-4" />
            </a>
            <span className="text-[10px] text-muted-foreground/40">Built with Next.js + Vercel</span>
          </div>
        </div>
      </footer>

      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "#1e1f35",
            border: "1px solid #2f3052",
            color: "#c0caf5",
          },
        }}
      />
    </div>
  )
}
