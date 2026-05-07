'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { LogoPulseLoader } from '@/components/shared/logo-loader'
import { useAvailableOffers } from '@/src/features/finance/hooks/useFinanceData'
import { formatCurrency } from '@/src/features/finance/utils'

export default function CursosDisponiveisPage() {
  const { data: offers, error, isLoading } = useAvailableOffers()

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LogoPulseLoader label="Carregando cursos disponíveis..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-sm text-destructive">
          Erro ao carregar cursos disponíveis: {error.message}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-8">
      <div className="space-y-1">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary/70">
          Cursos disponíveis
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Escolha um plano para contratar
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Veja os cursos disponíveis, compare os planos e avance para a matrícula.
        </p>
      </div>

      {offers.length === 0 ? (
        <Card className="border-dashed border-border/60 p-8 text-center">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Nenhum curso disponível no momento</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Quando houver novas ofertas, elas aparecerão aqui.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {offers.map((offer) => (
            <Link key={offer.id} href={`/cursos-disponiveis/${offer.id}`}>
              <Card className="group h-full border-border/60 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-border/60">
                        <Image
                          src={offer.course.language_icon}
                          alt={offer.course.language_name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">
                          {offer.course.name}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {offer.course.language_name} • Nível {offer.course.level_name}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground">{offer.name}</p>
                      <p className="text-sm text-muted-foreground">{offer.course.description}</p>
                    </div>
                  </div>

                  {offer.user_has_this_offer && (
                    <Badge className="rounded-full bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Contratado
                    </Badge>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">A partir de</p>
                    <p className="text-xl font-semibold text-foreground">
                      {formatCurrency(offer.price)}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                    Ver oferta
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
