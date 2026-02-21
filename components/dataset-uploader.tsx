"use client"

import { useCallback, useRef, useState } from "react"
import { Upload, FileSpreadsheet, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

interface DatasetUploaderProps {
  fileName: string | null
  fileSize: number | null
  onFileChange: (name: string | null, size: number | null) => void
}

export function DatasetUploader({ fileName, fileSize, onFileChange }: DatasetUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase()
      if (ext !== "csv" && ext !== "parquet") {
        toast.error("Unsupported file type. Please upload .csv or .parquet files.")
        return
      }
      onFileChange(file.name, file.size)
      toast.success(`File uploaded: ${file.name}`)
    },
    [onFileChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground">Dataset Import</CardTitle>
        <CardDescription className="text-xs">
          Upload ERCOT load + weather features or your own dataset.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          role="button"
          tabIndex={0}
          aria-label="Drop zone for dataset file upload"
          className={`relative flex flex-col items-center justify-center rounded-lg border border-dashed p-6 transition-colors cursor-pointer ${
            isDragging
              ? "border-tn-cyan bg-tn-cyan/5"
              : "border-border/60 hover:border-tn-blue/50 hover:bg-secondary/30"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              inputRef.current?.click()
            }
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.parquet"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
            aria-label="Upload dataset file"
          />
          <Upload className="size-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Drag & drop or <span className="text-tn-cyan underline">browse</span>
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">Accepts .csv, .parquet</p>
        </div>

        {fileName ? (
          <div className="mt-3 flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="size-4 text-tn-green" />
              <span className="text-sm text-foreground truncate max-w-[160px]">{fileName}</span>
              <span className="text-xs text-muted-foreground">{fileSize ? formatSize(fileSize) : ""}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onFileChange(null, null)
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Remove file"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground/50 text-center">No file selected</p>
        )}
      </CardContent>
    </Card>
  )
}
