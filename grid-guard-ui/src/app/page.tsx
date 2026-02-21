"use client";

import React, { useState } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  ReferenceLine
} from "recharts";
import {
  Zap, Github, UploadCloud, File, Play, RotateCcw, Download,
  Copy, Activity, AlertTriangle, TrendingDown, DollarSign,
  CloudLightning, Server, ShieldAlert
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

// --- MOCK DATA GENERATION ---
const generateMockData = () => {
  const data = [];
  let currentBaseline = 3500;
  for (let i = 0; i < 24; i++) {
    // Normal daily curve
    currentBaseline += Math.sin(i / 3) * 300 + (Math.random() * 100 - 50);
    const aiLoad = (i >= 12 && i <= 18) ? 800 : 100; // Spike in afternoon
    const attempted = currentBaseline + aiLoad;

    // Throttle logic
    const threshold = 4200;
    let throttled = attempted;
    let shed = 0;
    if (attempted > threshold) {
      // Simulate dampening curve for throttling
      throttled = threshold + (Math.random() * 50);
      shed = attempted - throttled;
    }

    data.push({
      time: `${i}:00`,
      baseline: Math.round(currentBaseline),
      aiLoad: aiLoad,
      attempted: Math.round(attempted),
      throttled: Math.round(throttled),
      shed: Math.round(shed)
    });
  }
  return data;
};

export default function GridGuardDashboard() {
  // States
  const [fileState, setFileState] = useState<{ name: string, size: string } | null>({ name: "ERCOT_Historical_2021_2024.csv", size: "84.2 MB" });
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  // Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileState({ name: file.name, size: (file.size / 1024).toFixed(1) + " KB" });
    }
  };

  const handleRunDemo = () => {
    setIsRunning(true);
    setHasRun(false);

    // Simulate loading
    setTimeout(() => {
      setChartData(generateMockData());
      setIsRunning(false);
      setHasRun(true);
    }, 1500);
  };

  const handleReset = () => {
    setHasRun(false);
    setChartData([]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans pb-24">

      {/* --- TOP NAV --- */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary drop-shadow-[0_0_8px_rgba(125,207,255,0.8)]" />
            <span className="font-semibold text-lg tracking-tight">Grid Guard</span>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
            <a href="#overview" className="hover:text-primary transition-colors">Overview</a>
            <a href="#demo" className="hover:text-primary transition-colors">Live Demo</a>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="hidden sm:inline-flex bg-white/5 border-white/10 text-xs text-primary">
              Tokyo Night Theme
            </Badge>
            <a href="https://github.com/AdityaP9116/TVGHackathon" target="_blank" rel="noreferrer">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/5">
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline">Repo</span>
              </Button>
            </a>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">

        {/* --- HERO SECTION --- */}
        <section id="overview" className="relative flex flex-col items-center text-center space-y-8 pt-8 pb-12">
          {/* Subtle glow behind title */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 px-3 py-1 text-sm">
            Hackathon Proof of Concept
          </Badge>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60">
            Grid Guard
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl font-light">
            Predictive compute throttling and ODE stabilization for the ERCOT power grid against catastrophic AI load spikes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button onClick={() => document.getElementById('uploader')?.click()} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(125,207,255,0.3)] gap-2">
              <UploadCloud className="h-4 w-4" /> Import Dataset
            </Button>
            <a href="https://github.com/AdityaP9116/TVGHackathon" target="_blank" rel="noreferrer">
              <Button variant="outline" size="lg" className="border-white/10 bg-white/5 hover:bg-white/10 gap-2">
                View GitHub <Github className="h-4 w-4" />
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 w-full max-w-4xl border-t border-white/5">
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-blue-500/10 p-3">
                <CloudLightning className="h-6 w-6 text-blue-400" />
              </div>
              <p className="text-sm font-medium">Forecast tomorrow’s baseline demand</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-purple-500/10 p-3">
                <Server className="h-6 w-6 text-purple-400" />
              </div>
              <p className="text-sm font-medium">Simulate AI data center stress</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-cyan-500/10 p-3">
                <ShieldAlert className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Trigger automated load-shedding</p>
            </div>
          </div>
        </section>

        {/* --- DEMO WORKSPACE SECTION --- */}
        <section id="demo" className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

          {/* Controls Column (Left) */}
          <div className="xl:col-span-4 flex flex-col gap-6">

            <Card className="border-white/5 bg-card/40 backdrop-blur-md shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <File className="h-4 w-4 text-muted-foreground" /> Dataset Import
                </CardTitle>
                <CardDescription>Upload ERCOT load + weather features or your own dataset.</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer group relative overflow-hidden"
                  onClick={() => document.getElementById('uploader')?.click()}
                >
                  <input type="file" id="uploader" className="hidden" accept=".csv,.parquet,.xlsx" onChange={handleFileUpload} />
                  {fileState ? (
                    <div className="flex flex-col items-center gap-2 text-primary">
                      <File className="h-8 w-8 drop-shadow-[0_0_8px_rgba(125,207,255,0.5)]" />
                      <span className="font-medium">{fileState.name}</span>
                      <span className="text-xs text-muted-foreground">{fileState.size}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                      <UploadCloud className="h-8 w-8 mb-2 opacity-50" />
                      <span className="font-medium text-sm">Drag & drop or click to upload</span>
                      <span className="text-xs opacity-50">Supports .csv, .parquet, .xlsx</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-card/40 backdrop-blur-md shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Play className="h-4 w-4 text-muted-foreground" /> Run Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Forecast Horizon</label>
                  <Select defaultValue="24h">
                    <SelectTrigger className="bg-black/20 border-white/10">
                      <SelectValue placeholder="Select horizon" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10 text-foreground">
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="48h">48 Hours</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Predictive Model</label>
                  <Select defaultValue="arima">
                    <SelectTrigger className="bg-black/20 border-white/10">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10 text-foreground">
                      <SelectItem value="arima">AutoARIMA (pmdarima)</SelectItem>
                      <SelectItem value="xgb">XGBoost Regressor</SelectItem>
                      <SelectItem value="base">Baseline Persistence</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Throttling Aggression</label>
                    <span className="text-xs font-mono text-primary">85%</span>
                  </div>
                  <Slider defaultValue={[85]} max={100} step={1} className="py-2" />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-medium">Include Weather Features</span>
                  <Switch defaultChecked />
                </div>
              </CardContent>
              <CardFooter className="flex gap-3 border-t border-white/5 pt-4">
                <Button
                  onClick={handleRunDemo}
                  disabled={isRunning || !fileState}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isRunning ? (
                    <span className="flex items-center gap-2 animate-pulse"><RotateCcw className="h-4 w-4 animate-spin" /> Solving ODE...</span>
                  ) : "Run Demo"}
                </Button>
                <Button onClick={handleReset} variant="ghost" size="icon" className="hover:bg-white/5" disabled={isRunning}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-white/5 bg-transparent shadow-none border-none">
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-white/10 bg-black/20 text-xs" disabled={!hasRun}>
                  <Download className="h-3 w-3 mr-2" /> Results (CSV)
                </Button>
                <Button variant="outline" className="flex-1 border-white/10 bg-black/20 text-xs" disabled={!hasRun}>
                  <Copy className="h-3 w-3 mr-2" /> Summary
                </Button>
              </div>
            </Card>

          </div>

          {/* Visualizations Column (Right) */}
          <div className="xl:col-span-8 flex flex-col gap-6">

            <Card className="border-white/5 bg-card/40 backdrop-blur-md shadow-2xl h-full flex flex-col overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5 bg-black/10">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">Model Visuals</CardTitle>
                </div>
                <div className="flex items-center gap-4">
                  {/* Mini Legend */}
                  <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground mr-4">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#1f77b4]" /> Baseline</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent" /> AI Load</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Throttled</span>
                  </div>
                  {isRunning && <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse">Running Simulation</Badge>}
                  {hasRun && <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">Live Demo</Badge>}
                </div>
              </CardHeader>

              <Tabs defaultValue="forecast" className="flex-1 flex flex-col">
                <div className="px-6 pt-4">
                  <TabsList className="bg-black/20 border border-white/5 w-full justify-start overflow-x-auto h-auto py-1">
                    <TabsTrigger value="forecast" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Forecast</TabsTrigger>
                    <TabsTrigger value="shedding" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">Load-Shedding</TabsTrigger>
                    <TabsTrigger value="stress" className="data-[state=active]:bg-destructive/20 data-[state=active]:text-destructive-foreground">Grid Stress</TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 p-6 relative min-h-[350px]">
                  {!hasRun && !isRunning ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/50 border-2 border-dashed border-white/5 m-6 rounded-xl">
                      <Activity className="h-12 w-12 mb-4 opacity-20" />
                      <p>Import a dataset and run the demo to view visualizations.</p>
                      <p className="text-xs font-mono mt-2 opacity-50">awaiting model outputs...</p>
                    </div>
                  ) : isRunning ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                  ) : (
                    <>
                      <TabsContent value="forecast" className="h-[350px] mt-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1f77b4" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#1f77b4" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="colorThrottled" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                            <RechartsTooltip
                              contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                              itemStyle={{ color: 'var(--foreground)' }}
                            />
                            <ReferenceLine y={4200} label={{ position: 'top', value: 'MAX SAFE CAPACITY', fill: 'var(--destructive)', fontSize: 10 }} stroke="var(--destructive)" strokeDasharray="3 3" />
                            <Area type="monotone" dataKey="attempted" name="Attempted Demand (MW)" stroke="var(--accent)" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                            <Area type="monotone" dataKey="baseline" name="Baseline (MW)" stroke="#1f77b4" fillOpacity={1} fill="url(#colorBaseline)" strokeWidth={2} />
                            <Area type="monotone" dataKey="throttled" name="Act. Grid Load (MW)" stroke="var(--primary)" fillOpacity={1} fill="url(#colorThrottled)" strokeWidth={3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </TabsContent>

                      <TabsContent value="shedding" className="h-[350px] mt-0 relative">
                        <div className="absolute top-0 right-4 bg-accent/10 border border-accent/20 rounded-lg p-3 z-10">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Energy Shed</p>
                          <p className="text-2xl font-bold text-accent">1,250 <span className="text-sm font-normal">MWh (demo)</span></p>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
                            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
                            <RechartsTooltip
                              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                              contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            />
                            <Bar dataKey="shed" name="Shed Amount (MW)" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </TabsContent>

                      <TabsContent value="stress" className="h-[350px] mt-0 flex flex-col justify-center items-center">
                        <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-8 border-destructive/20 shadow-[0_0_50px_rgba(255,50,50,0.15)]">
                          <svg className="absolute w-full h-full -rotate-90">
                            <circle cx="96" cy="96" r="88" fill="none" stroke="var(--destructive)" strokeWidth="16" strokeDasharray="552" strokeDashoffset="44" strokeLinecap="round" />
                          </svg>
                          <div className="text-center z-10">
                            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2 animate-pulse" />
                            <p className="text-4xl font-black text-destructive-foreground">92%</p>
                            <p className="text-xs text-muted-foreground uppercase mt-1">Peak Util</p>
                          </div>
                        </div>
                        <div className="mt-8 text-center space-y-2">
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Risk Level: HIGH</Badge>
                          <p className="text-sm text-muted-foreground max-w-sm">Imminent transformer failure predicted without automated shedding.</p>
                        </div>
                      </TabsContent>
                    </>
                  )}
                </div>
              </Tabs>
            </Card>

            {/* Run Summary Mini-Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-white/5 bg-black/20">
                <CardContent className="p-4 flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><TrendingDown className="h-3 w-3 text-primary" /> Peak Load</span>
                  <span className="text-xl font-bold font-mono text-white">{hasRun ? "4,221" : "---"} <span className="text-xs font-sans text-muted-foreground font-normal">MW</span></span>
                </CardContent>
              </Card>
              <Card className="border-white/5 bg-black/20">
                <CardContent className="p-4 flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Zap className="h-3 w-3 text-accent" /> Shed Energy</span>
                  <span className="text-xl font-bold font-mono text-white">{hasRun ? "1,250" : "---"} <span className="text-xs font-sans text-muted-foreground font-normal">MWh</span></span>
                </CardContent>
              </Card>
              <Card className="border-white/5 bg-black/20">
                <CardContent className="p-4 flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><ShieldAlert className="h-3 w-3 text-green-400" /> Stability Gain</span>
                  <span className="text-xl font-bold font-mono text-white">{hasRun ? "+98.4" : "---"} <span className="text-xs font-sans text-muted-foreground font-normal">%</span></span>
                </CardContent>
              </Card>
              <Card className="border-white/5 bg-black/20">
                <CardContent className="p-4 flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3 text-yellow-500" /> Cost Impact</span>
                  <span className="text-xl font-bold font-mono text-white">{hasRun ? "1.4M" : "---"} <span className="text-xs font-sans text-muted-foreground font-normal">Est. USD</span></span>
                </CardContent>
              </Card>
            </div>

          </div>
        </section>

        {/* --- EXPLANATION SECTION --- */}
        <section className="max-w-4xl mx-auto py-12 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">How it Works</h2>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm border border-primary/30">1</div>
                  <div>
                    <h3 className="font-semibold text-sm">Model Ingestion</h3>
                    <p className="text-sm text-muted-foreground mt-1">ARIMA model ingests 24 days of ERCOT load data & extreme weather exogenous features.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-sm border border-accent/30">2</div>
                  <div>
                    <h3 className="font-semibold text-sm">Predictive Profiling</h3>
                    <p className="text-sm text-muted-foreground mt-1">Generates a high-fidelity baseline curve predicting thermal limits and data center usage.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-destructive/20 text-destructive-foreground flex items-center justify-center font-bold text-sm border border-destructive/30">3</div>
                  <div>
                    <h3 className="font-semibold text-sm">ODE Stabilization Control</h3>
                    <p className="text-sm text-muted-foreground mt-1">A kill-switch throttles compute, mathematically calculating soft-landing grid stabilization.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-muted-foreground shadow-inner">
              <div className="flex items-center gap-2 mb-4 text-primary opacity-80">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="ml-2 font-sans font-medium uppercase tracking-widest text-[10px]">Math Kernel</span>
              </div>
              <p className="text-purple-400 mb-2"># 2nd Order Differential Equation for Grid Oscillation</p>
              <p className="text-foreground">def <span className="text-blue-400">stabilize_grid</span>(attempted, baseline):</p>
              <p className="ml-4 pl-4 border-l border-white/10 text-foreground">
                <span className="text-purple-400">''' <br />y'' + y' + 4y = 0<br />'''</span><br />
                zeta = <span className="text-orange-400">0.15</span><br />
                omega = <span className="text-orange-400">0.4</span><br />
                <span className="text-primary">return</span> baseline + (attempted - baseline) * np.exp(-zeta * t) * np.cos(omega * t)
              </p>

            </div>
          </div>
        </section>

      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/5 bg-black/20 mt-12 py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p className="flex items-center gap-2"><Zap className="h-3 w-3" /> Grid Guard • Energy Hackathon Prototype Concept</p>
          <div className="flex items-center gap-4">
            <span>Built with Next.js App Router + Vercel</span>
            <a href="https://github.com/AdityaP9116/TVGHackathon" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
              <Github className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
