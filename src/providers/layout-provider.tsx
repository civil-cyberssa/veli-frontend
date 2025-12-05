"use client"

import { useEffect } from "react"

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Aplicar densidade
    const density = localStorage.getItem("veli-layout-density") || "comfortable"
    document.documentElement.classList.remove("density-compact", "density-comfortable", "density-spacious")
    document.documentElement.classList.add(`density-${density}`)

    // Aplicar largura da sidebar
    const sidebarWidth = localStorage.getItem("veli-sidebar-width") || "normal"
    document.documentElement.classList.remove("sidebar-narrow", "sidebar-normal", "sidebar-wide")
    document.documentElement.classList.add(`sidebar-${sidebarWidth}`)
  }, [])

  return <>{children}</>
}
