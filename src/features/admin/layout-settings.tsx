"use client"

import { useEffect, useState } from "react"
import { Layout, Monitor, Moon, Sun, Maximize2, Minimize2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"

export function LayoutSettings() {
  const { theme, setTheme } = useTheme()
  const [density, setDensity] = useState<"compact" | "comfortable" | "spacious">("comfortable")
  const [sidebarWidth, setSidebarWidth] = useState<"narrow" | "normal" | "wide">("normal")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Carregar preferências do localStorage
    const savedDensity = localStorage.getItem("veli-layout-density") as typeof density
    const savedSidebarWidth = localStorage.getItem("veli-sidebar-width") as typeof sidebarWidth

    if (savedDensity) setDensity(savedDensity)
    if (savedSidebarWidth) setSidebarWidth(savedSidebarWidth)
  }, [])

  const handleDensityChange = (value: typeof density) => {
    setDensity(value)
    localStorage.setItem("veli-layout-density", value)

    // Aplicar densidade ao document root
    document.documentElement.classList.remove("density-compact", "density-comfortable", "density-spacious")
    document.documentElement.classList.add(`density-${value}`)
  }

  const handleSidebarWidthChange = (value: typeof sidebarWidth) => {
    setSidebarWidth(value)
    localStorage.setItem("veli-sidebar-width", value)

    // Aplicar largura da sidebar ao document root
    document.documentElement.classList.remove("sidebar-narrow", "sidebar-normal", "sidebar-wide")
    document.documentElement.classList.add(`sidebar-${value}`)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Tema */}
      <Card className="border-border/60">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Monitor className="h-5 w-5" />
            <CardTitle>Tema da Aplicação</CardTitle>
          </div>
          <CardDescription>
            Escolha entre tema claro, escuro ou automático baseado no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={theme} onValueChange={setTheme}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                <Sun className="h-4 w-4" />
                Claro
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                <Moon className="h-4 w-4" />
                Escuro
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer">
                <Monitor className="h-4 w-4" />
                Sistema
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Densidade */}
      <Card className="border-border/60">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Layout className="h-5 w-5" />
            <CardTitle>Densidade do Layout</CardTitle>
          </div>
          <CardDescription>
            Ajuste o espaçamento e tamanho dos elementos da interface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={density} onValueChange={(value) => handleDensityChange(value as typeof density)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="compact" id="compact" />
              <Label htmlFor="compact" className="flex items-center gap-2 cursor-pointer">
                <Minimize2 className="h-4 w-4" />
                Compacto - Mais informações visíveis
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="comfortable" id="comfortable" />
              <Label htmlFor="comfortable" className="flex items-center gap-2 cursor-pointer">
                <Layout className="h-4 w-4" />
                Confortável - Equilíbrio ideal
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="spacious" id="spacious" />
              <Label htmlFor="spacious" className="flex items-center gap-2 cursor-pointer">
                <Maximize2 className="h-4 w-4" />
                Espaçoso - Mais espaço entre elementos
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Largura da Sidebar */}
      <Card className="border-border/60">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Layout className="h-5 w-5 rotate-90" />
            <CardTitle>Largura da Barra Lateral</CardTitle>
          </div>
          <CardDescription>
            Configure a largura da barra de navegação lateral.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={sidebarWidth} onValueChange={(value) => handleSidebarWidthChange(value as typeof sidebarWidth)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="narrow" id="narrow" />
              <Label htmlFor="narrow" className="cursor-pointer">
                Estreita - Mais espaço para conteúdo
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="normal" id="normal" />
              <Label htmlFor="normal" className="cursor-pointer">
                Normal - Tamanho padrão
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="wide" id="wide" />
              <Label htmlFor="wide" className="cursor-pointer">
                Larga - Mais espaço para navegação
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  )
}
