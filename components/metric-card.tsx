import type { ReactNode } from "react"

interface MetricCardProps {
  icon: ReactNode
  label: string
  value: string
  unit: string
}

export function MetricCard({ icon, label, value, unit }: MetricCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border/40 bg-secondary/30 p-3 transition-colors hover:border-border/60">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-semibold font-mono text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  )
}
