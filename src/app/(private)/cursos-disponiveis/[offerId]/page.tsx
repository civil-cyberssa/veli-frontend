'use client'

import Image from 'next/image'
import Link from 'next/link'
import { use, useMemo } from 'react'
import { ArrowRight, CalendarDays, Clock3, FileText, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LogoPulseLoader } from '@/components/shared/logo-loader'
import { useAvailableOffers } from '@/src/features/finance/hooks/useFinanceData'
import { formatCurrency, formatWeekdays } from '@/src/features/finance/utils'

interface OfferDetailsPageProps {
  params: Promise<{
    offerId: string
  }>
}

export default function OfferDetailsPage({ params }: OfferDetailsPageProps) {
  const offerId = Number(use(params).offerId)
  const { data: offers, error, isLoading } = useAvailableOffers()

  const offer = useMemo(() => offers.find((item) => item.id === offerId), [offerId, offers])

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LogoPulseLoader label="Carregando oferta..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-sm text-destructive">Erro ao carregar oferta: {error.message}</p>
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Oferta não encontrada</h1>
        <Button asChild variant="outline">
          <Link href="/cursos-disponiveis">Voltar aos cursos</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-8">
      <div className="space-y-1">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary/70">
          Oferta
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{offer.name}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{offer.course.description}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card className="overflow-hidden border-border/60 shadow-sm">
            <div className="border-b border-border/50 bg-gradient-to-r from-[#109697]/10 via-background to-background px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-border/60">
                  <Image
                    src={offer.course.language_icon}
                    alt={offer.course.language_name}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-foreground">{offer.course.name}</h2>
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                      {offer.course.language_name}
                    </Badge>
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                      Nível {offer.course.level_name}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{offer.name}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-6 lg:grid-cols-2">
              <Card className="border-border/60 bg-muted/20 p-5 shadow-none">
                <div className="mb-4 flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Resumo
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Preço</p>
                    <p className="text-xl font-semibold text-foreground">
                      {formatCurrency(offer.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duração</p>
                    <p className="text-sm font-medium text-foreground">
                      {offer.access_duration_days
                        ? `${offer.access_duration_days} dias de acesso`
                        : 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Carência</p>
                    <p className="text-sm font-medium text-foreground">
                      {offer.grace_period_days} dias
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-border/60 bg-muted/20 p-5 shadow-none">
                <div className="mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Turmas disponíveis
                  </h3>
                </div>
                <div className="space-y-3">
                  {offer.student_classes.length > 0 ? (
                    offer.student_classes.map((studentClass) => (
                      <div
                        key={studentClass.id}
                        className="rounded-xl border border-border/60 bg-background px-4 py-3"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {studentClass.class_name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {studentClass.start_date} até {studentClass.finish_date}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {studentClass.time} • {formatWeekdays(studentClass.days_of_week)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma turma disponível.</p>
                  )}
                </div>
              </Card>
            </div>
          </Card>
        </div>

        <aside>
          <Card className="sticky top-20 border-border/60 p-6 shadow-sm">
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/60 bg-primary/5 p-5">
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary/70">
                  Matricular-se
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {formatCurrency(offer.price)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Escolha o turno e a forma de pagamento na próxima etapa.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background px-4 py-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Turmas</p>
                    <p className="text-sm font-medium text-foreground">
                      {offer.student_classes.length} opção(ões) disponível(is)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background px-4 py-3">
                  <Clock3 className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Turnos</p>
                    <p className="text-sm font-medium text-foreground">Manhã, tarde e noite</p>
                  </div>
                </div>
              </div>

              <Button asChild className="h-11 w-full">
                <Link href={`/cursos-disponiveis/${offer.id}/matricula`}>
                  Matricular-se
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
