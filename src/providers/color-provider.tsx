"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

const DEFAULT_COLORS = {
  primary: "#F2542D",
  secondary: "#0F9D9C",
}

type BrandColors = typeof DEFAULT_COLORS

interface ColorContextValue {
  colors: BrandColors
  defaults: BrandColors
  isReady: boolean
  updateColors: (colors: BrandColors) => void
  resetColors: () => void
}

const ColorContext = createContext<ColorContextValue | null>(null)

function applyColorsToDocument(colors: BrandColors) {
  if (typeof document === "undefined") return

  const root = document.documentElement
  root.style.setProperty("--primary", colors.primary)
  root.style.setProperty("--sidebar-primary", colors.primary)
  root.style.setProperty("--ring", colors.primary)
  root.style.setProperty("--secondary", colors.secondary)
  root.style.setProperty("--sidebar-accent", colors.secondary)
}

export function ColorProvider({ children }: { children: ReactNode }) {
  const [colors, setColors] = useState<BrandColors>(DEFAULT_COLORS)
  const [isReady, setIsReady] = useState(false)

  const loadStoredColors = useCallback(() => {
    if (typeof window === "undefined") return null

    const stored = localStorage.getItem("veli-custom-colors")
    if (!stored) return null

    try {
      return JSON.parse(stored) as BrandColors
    } catch (error) {
      console.error("Erro ao ler cores personalizadas:", error)
      return null
    }
  }, [])

  const persistColors = useCallback((nextColors: BrandColors) => {
    if (typeof window === "undefined") return
    localStorage.setItem("veli-custom-colors", JSON.stringify(nextColors))
  }, [])

  useEffect(() => {
    const storedColors = loadStoredColors()
    const initialColors = storedColors ?? DEFAULT_COLORS

    setColors(initialColors)
    applyColorsToDocument(initialColors)
    setIsReady(true)
  }, [loadStoredColors])

  const updateColors = useCallback(
    (nextColors: BrandColors) => {
      setColors(nextColors)
      applyColorsToDocument(nextColors)
      persistColors(nextColors)
    },
    [persistColors],
  )

  const resetColors = useCallback(() => {
    setColors(DEFAULT_COLORS)
    applyColorsToDocument(DEFAULT_COLORS)
    persistColors(DEFAULT_COLORS)
  }, [persistColors])

  const value = useMemo(
    () => ({
      colors,
      defaults: DEFAULT_COLORS,
      isReady,
      updateColors,
      resetColors,
    }),
    [colors, isReady, resetColors, updateColors],
  )

  return <ColorContext.Provider value={value}>{children}</ColorContext.Provider>
}

export function useBrandColors() {
  const context = useContext(ColorContext)
  if (!context) {
    throw new Error("useBrandColors deve ser usado dentro de um ColorProvider")
  }

  return context
}
