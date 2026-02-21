'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Settings, Play, ShieldAlert, ShieldCheck, Github } from 'lucide-react';

export default function GridGuardDashboard() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // Simulation Parameters
  const [maxCapacity, setMaxCapacity] = useState(4000);
  const [aiSpike, setAiSpike] = useState(600);
  const [tmax, setTmax] = useState(105);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_capacity: maxCapacity,
          ai_spike: aiSpike,
          tmax: tmax,
          tmin: 80,
          wind: 5,
        }),
      });
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Simulation failed:", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#1a1b26] text-[#c0caf5] font-sans p-8 selection:bg-[#33467c] selection:text-[#c0caf5]">
      {/* Header */}
      <header className="flex justify-between items-center mb-12 border-b border-[#292e42] pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#7aa2f7] flex items-center gap-3">
            Grid-Guard
            {results && (
              results.is_throttled ? 
              <ShieldAlert className="text-[#f7768e] w-8 h-8 animate-pulse" /> : 
              <ShieldCheck className="text-[#9ece6a] w-8 h-8" />
            )}
          </h1>
          <p className="text-[#565f89] mt-2 tracking-wide text-sm uppercase">Compute-Throttling Stabilization System</p>
        </div>
        
        <a 
          href="https://github.com/AdityaP9116/TVGHackathon" 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center gap-2 text-[#a9b1d6] hover:text-[#7aa2f7] transition-colors"
        >
          <Github className="w-5 h-5" />
          <span className="text-sm font-medium">Repository</span>
        </a>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        
        {/* Controls Sidebar */}
        <div className="bg-[#24283b] p-6 rounded-xl border border-[#292e42] shadow-2xl h-fit">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="text-[#7aa2f7] w-5 h-5" />
            <h2 className="text-lg font-semibold text-[#a9b1d6]">Simulation Parameters</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#9aa5ce] mb-2 flex justify-between">
                <span>Max Safe Capacity</span>
                <span className="text-[#7aa2f7] font-mono">{maxCapacity} MW</span>
              </label>
              <input 
                type="range" min="3000" max="5000" step="50" value={maxCapacity} 
                onChange={(e) => setMaxCapacity(parseInt(e.target.value))}
                className="w-full h-1 bg-[#16161e] rounded-lg appearance-none cursor-pointer accent-[#7aa2f7]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#9aa5ce] mb-2 flex justify-between">
                <span>AI Data Center Spike</span>
                <span className="text-[#bb9af7] font-mono">+{aiSpike} MW</span>
              </label>
              <input 
                type="range" min="100" max="1500" step="50" value={aiSpike} 
                onChange={(e) => setAiSpike(parseInt(e.target.value))}
                className="w-full h-1 bg-[#16161e] rounded-lg appearance-none cursor-pointer accent-[#bb9af7]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#9aa5ce] mb-2 flex justify-between">
                <span>Max Temperature</span>
                <span className="text-[#ff9e64] font-mono">{tmax} °F</span>
              </label>
              <input 
                type="range" min="70" max="115" step="1" value={tmax} 
                onChange={(e) => setTmax(parseInt(e.target.value))}
                className="w-full h-1 bg-[#16161e] rounded-lg appearance-none cursor-pointer accent-[#ff9e64]"
              />
            </div>
          </div>

          <button 
            onClick={runSimulation}
            disabled={loading}
            className="w-full mt-8 bg-[#7aa2f7] hover:bg-[#8caaee] text-[#1a1b26] font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(122,162,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <span className="animate-pulse">Initializing Data Pipeline...</span> : <><Play className="w-5 h-5" /> Run Simulation</>}
          </button>
        </div>

        {/* Chart Visualization */}
        <div className="lg:col-span-2 bg-[#24283b] p-6 rounded-xl border border-[#292e42] shadow-2xl flex flex-col">
          <h2 className="text-lg font-semibold text-[#a9b1d6] mb-6">Live Grid Telemetry</h2>
          
          <div className="flex-grow w-full h-[400px]">
            {results ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={results.chart_data}>
                  <XAxis 
                    dataKey="time" 
                    type="number" 
                    domain={['dataMin', 'dataMax']} 
                    hide 
                  />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    stroke="#565f89" 
                    tick={{fill: '#565f89'}} 
                    tickFormatter={(val) => `${Math.round(val)} MW`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#16161e', borderColor: '#292e42', borderRadius: '8px', color: '#c0caf5' }}
                    itemStyle={{ color: '#7aa2f7' }}
                    formatter={(value: number) => [`${value.toFixed(1)} MW`, 'Total Load']}
                    labelFormatter={() => ''}
                  />
                  <ReferenceLine y={maxCapacity} stroke="#f7768e" strokeDasharray="3 3">
                    {/* Add label using an optional approach if needed, or rely on tooltip */}
                  </ReferenceLine>
                  <Line 
                    type="monotone" 
                    dataKey="load" 
                    stroke={results.is_throttled ? "#bb9af7" : "#7aa2f7"} 
                    strokeWidth={3} 
                    dot={false}
                    activeDot={{ r: 6, fill: '#ff9e64', stroke: '#24283b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full border border-dashed border-[#292e42] rounded-lg flex items-center justify-center text-[#565f89]">
                Await Simulation Start
              </div>
            )}
          </div>

          {/* Stats Bar */}
          {results && (
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#292e42]">
              <div className="bg-[#16161e] p-4 rounded-lg border border-[#292e42]">
                <p className="text-sm tracking-wide text-[#565f89] uppercase mb-1">Baseline Model Load</p>
                <p className="text-2xl font-light text-[#c0caf5] font-mono">{results.baseline_load.toFixed(1)} <span className="text-sm text-[#737aa2]">MW</span></p>
              </div>
              <div className={`p-4 rounded-lg border ${results.is_throttled ? 'bg-[#f7768e]/10 border-[#f7768e]/30' : 'bg-[#9ece6a]/10 border-[#9ece6a]/30'}`}>
                <p className="text-sm tracking-wide uppercase mb-1 font-bold" style={{ color: results.is_throttled ? '#f7768e' : '#9ece6a' }}>
                  Safety Status
                </p>
                <p className="text-xl font-medium tracking-wide flex items-center gap-2" style={{ color: results.is_throttled ? '#f7768e' : '#9ece6a' }}>
                  {results.is_throttled ? 'KILL SWITCH TRIGGERED' : 'CAPACITY STABLE'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
