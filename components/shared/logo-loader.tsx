"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoPulseLoaderProps {
  label?: string
  size?: number
  className?: string
}

export function LogoPulseLoader({ label, size = 72, className }: LogoPulseLoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 text-center", className)}>
      <div className="rounded-2xl bg-primary/10 p-4 shadow-sm">
        <Image
          src="/logo/logo.svg"
          alt="Veli"
          width={size}
          height={size}
          priority
          className="animate-pulse drop-shadow-sm"
        />
      </div>
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  )
}
