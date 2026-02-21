"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Copy } from "lucide-react"
import { toast } from "sonner"

interface OutputExportProps {
  hasResults: boolean
}

export function OutputExport({ hasResults }: OutputExportProps) {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground">Output Export</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasResults}
          className="flex-1 border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          onClick={() => toast.success("Results CSV downloaded (demo)")}
        >
          <Download className="size-3.5" />
          Download CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasResults}
          className="flex-1 border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          onClick={() => {
            navigator.clipboard.writeText("Grid-Guard Demo: Peak=4612MW, Shed=1247MWh, Stability=+18.3%")
            toast.success("Summary copied to clipboard")
          }}
        >
          <Copy className="size-3.5" />
          Copy Summary
        </Button>
      </CardContent>
    </Card>
  )
}
