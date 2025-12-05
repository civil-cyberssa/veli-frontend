"use client"

import { useEffect, useState } from "react"
import { Palette, RefreshCw, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useBrandColors } from "@/src/providers/color-provider"

function normalizeColor(value: string, fallback: string) {
  if (!value) return fallback
  return value.startsWith("#") ? value : fallback
}

export function ColorSettings({ managerName }: { managerName?: string }) {
  const { colors, defaults, updateColors, resetColors, isReady } = useBrandColors()
  const [primary, setPrimary] = useState(colors.primary)
  const [secondary, setSecondary] = useState(colors.secondary)

  useEffect(() => {
    if (!isReady) return
    setPrimary(colors.primary)
    setSecondary(colors.secondary)
  }, [colors.primary, colors.secondary, isReady])

  const handleSave = () => {
    updateColors({
      primary: normalizeColor(primary, defaults.primary),
      secondary: normalizeColor(secondary, defaults.secondary),
    })
  }

  const handleReset = () => {
    resetColors()
    setPrimary(defaults.primary)
    setSecondary(defaults.secondary)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{managerName ? `Olá, ${managerName}` : "Área do gestor"}</p>
        <h1 className="text-2xl font-semibold">Personalizar cores</h1>
        <p className="text-sm text-muted-foreground">
          Defina as cores principais que serão usadas em botões, destaques e detalhes da plataforma.
        </p>
      </div>

      <Card className="border-border/60">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Palette className="h-5 w-5" />
            <CardTitle>Cores da marca</CardTitle>
          </div>
          <CardDescription>Atualize primária e secundária para refletir a identidade visual da empresa.</CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Cor primária</Label>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={normalizeColor(primary, defaults.primary)}
                onChange={(e) => setPrimary(e.target.value)}
                className="h-11 w-20 cursor-pointer"
                aria-label="Selecionar cor primária"
              />
              <Input
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                placeholder="#F2542D"
                className="flex-1"
                aria-label="Código da cor primária"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Usada em botões, destaques e elementos principais da interface.
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Cor secundária</Label>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={normalizeColor(secondary, defaults.secondary)}
                onChange={(e) => setSecondary(e.target.value)}
                className="h-11 w-20 cursor-pointer"
                aria-label="Selecionar cor secundária"
              />
              <Input
                value={secondary}
                onChange={(e) => setSecondary(e.target.value)}
                placeholder="#0F9D9C"
                className="flex-1"
                aria-label="Código da cor secundária"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Reforça contrastes e elementos auxiliares, como cards e badges.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-border/40 bg-muted/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-secondary" aria-hidden />
            <span>Pré-visualize as mudanças em tempo real.</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Restaurar padrão
            </Button>
            <Button className="flex-1 sm:flex-none" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar cores
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
