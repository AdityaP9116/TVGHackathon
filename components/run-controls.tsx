"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Play, RotateCcw, Loader2 } from "lucide-react"

interface RunControlsProps {
  isRunning: boolean
  onRun: () => void
  onReset: () => void
}

export function RunControls({ isRunning, onRun, onReset }: RunControlsProps) {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground">Run Configuration</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="forecast-horizon" className="text-xs text-muted-foreground">
            Forecast Horizon
          </Label>
          <Select defaultValue="24h">
            <SelectTrigger id="forecast-horizon" className="w-full bg-secondary/40 border-border/50 text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 hours</SelectItem>
              <SelectItem value="48h">48 hours</SelectItem>
              <SelectItem value="7d">7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="model-select" className="text-xs text-muted-foreground">
            Model
          </Label>
          <Select defaultValue="autoarima">
            <SelectTrigger id="model-select" className="w-full bg-secondary/40 border-border/50 text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="autoarima">AutoARIMA (pmdarima)</SelectItem>
              <SelectItem value="xgboost">XGBoost</SelectItem>
              <SelectItem value="baseline">Baseline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="throttle-slider" className="text-xs text-muted-foreground">
              Throttling Aggressiveness
            </Label>
            <span className="text-xs font-mono text-tn-cyan">65%</span>
          </div>
          <Slider
            id="throttle-slider"
            defaultValue={[65]}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="weather-toggle" className="text-xs text-muted-foreground">
            Include weather features
          </Label>
          <Switch id="weather-toggle" defaultChecked />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button
            onClick={onRun}
            disabled={isRunning}
            className="flex-1 bg-tn-blue text-primary-foreground hover:bg-tn-blue/80 shadow-[0_0_20px_rgba(122,162,247,0.15)] transition-all"
          >
            {isRunning ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="size-4" />
                Run Demo
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            className="border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          >
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
