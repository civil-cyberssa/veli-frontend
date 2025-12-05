'use client'
import { redirect } from "next/navigation"
import { ColorSettings } from "@/src/features/admin/color-settings"
import { AdminStats } from "@/src/features/admin/admin-stats"
import { LayoutSettings } from "@/src/features/admin/layout-settings"
import { useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Palette, Layout, Shield } from "lucide-react"

export default function AdminPage() {
  const { data: session } = useSession()

  if (!session || (session.role as string | undefined)?.toLowerCase() !== "manager") {
    redirect("/home")
  }

  const managerName = session.student_full_name || "Gestor"

  return (
    <div className="py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Shield className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Painel de Administração</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Olá, {managerName}! Gerencie configurações da plataforma e visualize estatísticas.
        </p>
      </div>

      {/* Tabs de navegação */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Cores da Marca
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Layout
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Estatísticas da Plataforma</h2>
            <AdminStats />
          </div>

          <div className="grid gap-4 md:grid-cols-2 mt-6">
            <div className="p-6 rounded-lg border border-border/60 bg-card">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Personalização
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Configure as cores da marca para refletir a identidade visual da sua empresa.
              </p>
              <button
                onClick={() => {
                  const tabsTrigger = document.querySelector('[value="colors"]') as HTMLButtonElement
                  tabsTrigger?.click()
                }}
                className="text-sm text-primary hover:underline font-medium"
              >
                Configurar cores →
              </button>
            </div>

            <div className="p-6 rounded-lg border border-border/60 bg-card">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" />
                Layout da Aplicação
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Ajuste a densidade, tema e outras configurações de interface para todos os usuários.
              </p>
              <button
                onClick={() => {
                  const tabsTrigger = document.querySelector('[value="layout"]') as HTMLButtonElement
                  tabsTrigger?.click()
                }}
                className="text-sm text-primary hover:underline font-medium"
              >
                Configurar layout →
              </button>
            </div>
          </div>
        </TabsContent>

        {/* Cores da Marca */}
        <TabsContent value="colors" className="mt-6">
          <ColorSettings managerName={managerName} />
        </TabsContent>

        {/* Layout */}
        <TabsContent value="layout" className="mt-6">
          <div className="space-y-2 mb-6">
            <h2 className="text-2xl font-semibold">Configurações de Layout</h2>
            <p className="text-sm text-muted-foreground">
              Personalize a aparência e comportamento da interface para melhor experiência.
            </p>
          </div>
          <LayoutSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
