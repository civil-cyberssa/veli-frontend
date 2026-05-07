'use client'

import Link from 'next/link'
import { use, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2, CircleHelp, CreditCard, Loader2, SunMedium } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { LogoPulseLoader } from '@/components/shared/logo-loader'
import {
  useAvailableOffers,
  useCreateOrder,
} from '@/src/features/finance/hooks/useFinanceData'
import {
  billingGroupLabels,
  billingMethodLabels,
  billingTabLabels,
  groupBillingOptions,
  periodOptions,
} from '@/src/features/finance/offer-utils'
import { formatCurrency } from '@/src/features/finance/utils'

interface OfferEnrollmentPageProps {
  params: Promise<{
    offerId: string
  }>
}

export default function OfferEnrollmentPage({ params }: OfferEnrollmentPageProps) {
  const offerId = Number(use(params).offerId)
  const router = useRouter()
  const { data: offers, error, isLoading } = useAvailableOffers()
  const { createOrder } = useCreateOrder()

  const offer = useMemo(() => offers.find((item) => item.id === offerId), [offerId, offers])
  const groupedOptions = useMemo(
    () => (offer ? groupBillingOptions(offer.billing_options) : {}),
    [offer]
  )

  const [selectedPeriod, setSelectedPeriod] = useState<string>('')
  const [selectedStudentClassId, setSelectedStudentClassId] = useState<number | null>(null)
  const [usePeriodSelection, setUsePeriodSelection] = useState(false)
  const [selectedBillingGroup, setSelectedBillingGroup] = useState<'one_time' | 'recurring' | ''>('')
  const [selectedBillingCode, setSelectedBillingCode] = useState<string>('')
  const [selectedInstallments, setSelectedInstallments] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedBillingOption = offer?.billing_options.find((option) => option.code === selectedBillingCode)
  const selectedStudentClass = offer?.student_classes.find(
    (studentClass) => studentClass.id === selectedStudentClassId
  )
  const summaryPrice =
    selectedBillingOption?.type === 'recurring' ? Number(offer?.price ?? 0) : Number(selectedBillingOption?.price ?? offer?.price ?? 0)
  const canSubmit = Boolean(
    selectedBillingGroup &&
      selectedBillingOption &&
      (usePeriodSelection ? selectedPeriod : selectedStudentClassId)
  )

  useEffect(() => {
    if (!offer) return

    if (offer.student_classes.length === 0) {
      setUsePeriodSelection(true)
      return
    }

    setSelectedStudentClassId((current) => current ?? offer.student_classes[0].id)
  }, [offer])

  useEffect(() => {
    if (!selectedBillingOption || !selectedBillingGroup) return

    const nextInstallments = selectedBillingOption.allowed_installments[0] ?? 1
    setSelectedInstallments(nextInstallments)
  }, [selectedBillingGroup, selectedBillingOption])

  useEffect(() => {
    if (!selectedBillingGroup) {
      setSelectedBillingCode('')
      return
    }

    const visibleOptions = groupedOptions[selectedBillingGroup] ?? []
    if (visibleOptions.length === 0) {
      setSelectedBillingCode('')
      return
    }

    const stillVisible = visibleOptions.some((option) => option.code === selectedBillingCode)
    if (!stillVisible) {
      setSelectedBillingCode(visibleOptions[0].code)
    }
  }, [groupedOptions, selectedBillingCode, selectedBillingGroup])

  const handleSubmit = async () => {
    if (!offer || !selectedBillingOption || !selectedBillingGroup) return

    if (usePeriodSelection && !selectedPeriod) return
    if (!usePeriodSelection && !selectedStudentClassId) return

    setIsSubmitting(true)

    try {
      const response = await createOrder({
        offer_id: offer.id,
        ...(usePeriodSelection
          ? { preference_period: [selectedPeriod] }
          : selectedStudentClassId
            ? { student_class_id: selectedStudentClassId }
            : {}),
        billing_option_code: selectedBillingOption.code,
        installments: selectedInstallments,
      })

      const nextOrderId =
        typeof response.order_id === 'number'
          ? response.order_id
          : typeof response.id === 'number'
            ? response.id
            : null

      toast.success('Pedido criado com sucesso.')

      if (nextOrderId) {
        router.push(`/financeiro/pagamentos/${nextOrderId}`)
        return
      }

      router.push('/financeiro')
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : 'Não foi possível criar o pedido.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LogoPulseLoader label="Carregando matrícula..." />
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
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-8">
      <div className="space-y-1">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary/70">
          Matrícula
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{offer.name}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Escolha o turno e a forma de pagamento para seguir para o pedido.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-border/60 p-6 shadow-sm">
          <div className="space-y-6">
            <div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold">
                  {usePeriodSelection ? 'Escolha o turno' : 'Escolha a turma'}
                </h2>
                {offer.student_classes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setUsePeriodSelection((current) => !current)}
                    className="text-sm font-medium text-primary underline underline-offset-4"
                  >
                    {usePeriodSelection ? 'Quero escolher uma turma' : 'Não quero esses horários'}
                  </button>
                )}
              </div>

              {usePeriodSelection ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {periodOptions.map((period) => {
                    const isActive = selectedPeriod === period.value
                    return (
                      <button
                        key={period.value}
                        type="button"
                        onClick={() => setSelectedPeriod(period.value)}
                        className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                          isActive
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'border-border/60 bg-background hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-primary/10 p-2 text-primary">
                            <SunMedium className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{period.label}</p>
                            <p className="text-xs text-muted-foreground">Preferência de horário</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {offer.student_classes.map((studentClass) => {
                    const isActive = selectedStudentClassId === studentClass.id
                    return (
                      <button
                        key={studentClass.id}
                        type="button"
                        onClick={() => setSelectedStudentClassId(studentClass.id)}
                        className={`w-full rounded-2xl border px-4 py-4 text-left transition-all ${
                          isActive
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'border-border/60 bg-background hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-foreground">{studentClass.class_name}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {studentClass.start_date} até {studentClass.finish_date}
                            </p>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <p>{studentClass.time}</p>
                            <p>{studentClass.days_of_week.join(' • ')}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold">Escolha o meio de pagamento</h2>
              <div className="mt-4 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {(['one_time', 'recurring'] as const)
                    .filter((groupKey) => (groupedOptions[groupKey] ?? []).length > 0)
                    .map((groupKey) => {
                      const isActive = selectedBillingGroup === groupKey
                      return (
                        <button
                          key={groupKey}
                          type="button"
                          onClick={() => setSelectedBillingGroup(groupKey)}
                          className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                            isActive
                              ? 'border-primary bg-primary/10 shadow-sm'
                              : 'border-border/60 bg-background hover:border-primary/30'
                          }`}
                        >
                          <p className="font-semibold text-foreground">
                            {billingTabLabels[groupKey]}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {billingGroupLabels[groupKey]}
                          </p>
                        </button>
                      )
                    })}
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    selectedBillingGroup ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  {selectedBillingGroup ? (
                    <Card className="border-border/60 bg-muted/20 p-5 shadow-none transition-all duration-300 ease-out animate-in fade-in-0">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {billingTabLabels[selectedBillingGroup]}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Escolha entre Pix e cartão de crédito
                          </p>
                        </div>
                        {(groupedOptions[selectedBillingGroup]?.length ?? 0) > 1 && (
                          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                            {groupedOptions[selectedBillingGroup].length} opções
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-3">
                        {(groupedOptions[selectedBillingGroup] ?? []).map((option) => {
                          const isSelected = selectedBillingCode === option.code
                          const isAutomaticPix =
                            option.type === 'recurring' && option.billing_method === 'pix'
                          return (
                            <button
                              key={option.code}
                              type="button"
                              onClick={() => setSelectedBillingCode(option.code)}
                              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-all ${
                                isSelected
                                  ? 'border-primary bg-background shadow-sm'
                                  : 'border-border/60 bg-background/80 hover:border-primary/30'
                              }`}
                            >
                              <div className="space-y-1">
                                <p className="font-medium text-foreground">
                                  {billingMethodLabels[option.billing_method] ?? option.billing_method}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {billingGroupLabels[option.type] ?? option.type}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-foreground">
                                  {formatCurrency(option.price)}
                                </p>
                                {isAutomaticPix ? (
                                  <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                                    <span>No pix automático</span>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="inline-flex cursor-help text-muted-foreground/80">
                                          <CircleHelp className="h-3.5 w-3.5" />
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" sideOffset={8}>
                                        O valor será debitado todos os meses automaticamente da sua conta.
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground">
                                    {option.type === 'recurring'
                                      ? 'mensalidade'
                                      : option.billing_method === 'pix'
                                        ? ''
                                        : option.allowed_installments.length > 1
                                          ? `até ${Math.max(...option.allowed_installments)}x`
                                          : 'sem parcelamento'}
                                  </p>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </Card>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-border/60 p-6 shadow-sm">
          <div className="space-y-5">
            <div className="rounded-2xl border border-border/60 bg-primary/5 p-5">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary/70">
                Resumo do pedido
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {formatCurrency(summaryPrice)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{offer.course.name}</p>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {usePeriodSelection ? 'Turno escolhido' : 'Turma escolhida'}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {usePeriodSelection
                    ? periodOptions.find((item) => item.value === selectedPeriod)?.label ?? 'Selecione um turno'
                    : selectedStudentClass?.class_name ?? 'Selecione uma turma'}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
                <p className="text-xs text-muted-foreground">Forma de pagamento</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {selectedBillingOption
                    ? `${billingGroupLabels[selectedBillingOption.type] ?? selectedBillingOption.type} • ${billingMethodLabels[selectedBillingOption.billing_method] ?? selectedBillingOption.billing_method}`
                    : 'Selecione uma opção'}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
                <p className="text-xs text-muted-foreground">Turmas disponíveis</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {selectedStudentClass?.class_name ??
                    periodOptions.find((item) => item.value === selectedPeriod)?.label ??
                    'Selecione uma turma ou turno'}
                </p>
              </div>
            </div>

            <Button className="h-11 w-full" disabled={!canSubmit || isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando pedido
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Seguir para pagamento
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground">
              O botão será habilitado após escolher o turno e uma forma de pagamento.
            </p>

            {offer.user_has_this_offer && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Você já possui esta oferta
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
