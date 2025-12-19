"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { PlayCircle, ArrowRight, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogoPulseLoader } from "@/components/shared/logo-loader"
import { useSubscriptions } from "@/features/dashboard/hooks/useSubscription"
import { cn } from "@/lib/utils"

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
    <div className="pb-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 shadow-lg shadow-primary/5">
            <PlayCircle className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Minhas Aulas
            </h1>
            <p className="text-base text-muted-foreground font-medium">
              Selecione um curso para acessar suas aulas ao vivo
            </p>
          </div>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {subscriptions.map((subscription, index) => (
          <Card
            key={subscription.id}
            className={cn(
              "group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer",
              "bg-gradient-to-br from-card via-card to-muted/20",
              "hover:-translate-y-1"
            )}
            style={{
              animationDelay: `${index * 100}ms`,
              animation: "fadeInUp 0.5s ease-out forwards",
              opacity: 0,
            }}
            onClick={() => router.push(`/minhas-aulas/${subscription.student_class_id}`)}
          >
            {/* Gradient Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Shine Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>

            <div className="relative p-7 space-y-6">
              {/* Course Icon and Info */}
              <div className="flex items-start gap-5">
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Image
                    src={subscription.course_icon}
                    alt={subscription.course_name}
                    width={64}
                    height={64}
                    className="relative h-16 w-16 rounded-2xl object-cover ring-2 ring-background shadow-xl group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-500">
                    <PlayCircle className="h-5 w-5 text-primary-foreground fill-current" />
                  </div>
                </div>

                <div className="flex-1 space-y-2 min-w-0">
                  <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
                    {subscription.course_name}
                  </h3>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs px-2.5 py-1 font-semibold",
                      subscription.status === 'active'
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {subscription.status === 'active' ? (
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Ativo
                      </span>
                    ) : subscription.status}
                  </Badge>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                className={cn(
                  "w-full h-11 font-semibold shadow-lg shadow-primary/25",
                  "bg-gradient-to-r from-primary to-primary/90",
                  "hover:shadow-xl hover:shadow-primary/30",
                  "transition-all duration-300 group/btn"
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/minhas-aulas/${subscription.student_class_id}`)
                }}
              >
                <span className="flex items-center gap-2">
                  Acessar aulas ao vivo
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
