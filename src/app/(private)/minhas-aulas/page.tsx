"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { PlayCircle, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogoPulseLoader } from "@/components/shared/logo-loader"

import { cn } from "@/lib/utils"
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
    <div className="max-w-7xl mx-auto pb-16 space-y-10">
      {/* Simple Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">
          Minhas Aulas
        </h1>
        <p className="text-muted-foreground">
          Selecione um curso para acessar suas aulas ao vivo
        </p>
      </div>

      {/* Course Cards Grid - Simplified */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subscriptions.map((subscription) => (
          <Card
            key={subscription.id}
            className="group border transition-all hover:border-primary/50 cursor-pointer"
            onClick={() => router.push(`/minhas-aulas/${subscription.student_class_id}`)}
          >
            <div className="p-6 space-y-6">
              {/* Course Icon and Info */}
              <div className="flex items-start gap-4">
                <Image
                  src={subscription.course_icon}
                  alt={subscription.course_name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-lg object-cover"
                />

                <div className="flex-1 space-y-2 min-w-0">
                  <h3 className="font-semibold text-base leading-tight line-clamp-2">
                    {subscription.course_name}
                  </h3>
                  <Badge
                    variant={subscription.status === 'active' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {subscription.status === 'active' ? 'Ativo' : subscription.status}
                  </Badge>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                variant="outline"
                className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/minhas-aulas/${subscription.student_class_id}`)
                }}
              >
                Acessar aulas
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
