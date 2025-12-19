"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { PlayCircle, ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogoPulseLoader } from "@/components/shared/logo-loader"
import { useSubscriptions } from "@/src/features/dashboard/hooks/useSubscription"


export default function MinhasAulasPage() {
  const router = useRouter()
  const { data: subscriptions, loading, error } = useSubscriptions()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LogoPulseLoader label="Carregando seus cursos..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-sm text-destructive">Erro ao carregar cursos: {error.message}</p>
      </div>
    )
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-sm text-muted-foreground">Nenhum curso encontrado</p>
      </div>
    )
  }

  return (
    <div className="pb-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Minhas Aulas
          </h1>
          <p className="text-sm text-muted-foreground">
            Selecione um curso para ver as aulas ao vivo
          </p>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subscriptions.map((subscription) => (
          <Card
            key={subscription.id}
            className="group relative overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:border-primary/30 hover:scale-[1.02]"
            onClick={() => router.push(`/minhas-aulas/${subscription.student_class_id}`)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Image
                    src={subscription.course_icon}
                    alt={subscription.course_name}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-xl object-cover ring-2 ring-background shadow-sm"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary/20 shadow-sm">
                    <PlayCircle className="h-4 w-4 text-primary" />
                  </div>
                </div>

                <div className="flex-1 space-y-1.5">
                  <h3 className="font-semibold text-base leading-tight line-clamp-2">
                    {subscription.course_name}
                  </h3>
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {subscription.status === 'active' ? 'Ativo' : subscription.status}
                  </Badge>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  className="w-full h-10 shadow-sm hover:shadow-md transition-all group/btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/minhas-aulas/${subscription.student_class_id}`)
                  }}
                >
                  Ver aulas ao vivo
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
