'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  LockKeyhole,
  Wallet,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { LogoPulseLoader } from '@/components/shared/logo-loader'
import { cn } from '@/lib/utils'
import {
  useCurrentContractedOffer,
  usePendingPayments,
} from '@/src/features/finance/hooks/useFinanceData'
import {
  checkoutStatusMap,
  chargeStatusMap,
  formatCurrency,
  formatDate,
  formatWeekdays,
  getVisiblePaymentCycles,
  paymentModeMap,
  paymentTypeMap,
} from '@/src/features/finance/utils'
import type { PaymentCycle, PendingPayment } from '@/src/features/finance/types'

const statusToneMap: Record<string, string> = {
  pending_payment: 'bg-amber-100 text-amber-800 border-amber-200',
  processing: 'bg-sky-100 text-sky-800 border-sky-200',
  pending_contract: 'bg-slate-100 text-slate-700 border-slate-200',
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  pending_signature: 'bg-amber-100 text-amber-800 border-amber-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  waiting_payment: 'bg-amber-100 text-amber-800 border-amber-200',
  overdue: 'bg-rose-100 text-rose-800 border-rose-200',
  canceled: 'bg-rose-100 text-rose-800 border-rose-200',
}

const pendingCheckoutStatuses = new Set(['pending_payment', 'processing'])

function StatusBadge({ value, label }: { value: string; label: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-full px-3 py-1 text-xs font-medium',
        statusToneMap[value] ?? 'bg-slate-100 text-slate-700 border-slate-200'
      )}
    >
      {label}
    </Badge>
  )
}

function PixIcon() {
  return (
    <Image
      src="https://user-images.githubusercontent.com/33992396/99478349-ff1b1280-2932-11eb-8776-1942bbe1a52a.png"
      alt="Pix"
      width={20}
      height={20}
      className="h-5 w-5 object-contain"
    />
  )
}

function OfferStatusDot({ status }: { status: string }) {
  const tone =
    status === 'active' || status === 'paid'
      ? 'bg-emerald-500'
      : 'bg-rose-500'

  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${tone}`} />
}

function MonthlyPixCycleCard({
  payment,
  cycle,
  selectionMode,
  selected,
  selectable,
  onStartAdvance,
  onToggle,
}: {
  payment: PendingPayment
  cycle: PaymentCycle
  selectionMode: boolean
  selected: boolean
  selectable: boolean
  onStartAdvance: (cycleNumber: number) => void
  onToggle: (cycleNumber: number) => void
}) {
  const cycleTotal =
    payment.pending_cycle_total ??
    payment.payment_cycles?.reduce(
      (highestCycle, cycle) => Math.max(highestCycle, cycle.cycle_number),
      0
    )

  const card = (
      <Card
        className={cn(
          'group relative h-full border-border/60 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md',
          selectionMode && selectable && 'cursor-pointer',
          selected && 'border-primary/50 ring-2 ring-primary/20'
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                value={cycle.status}
                label={chargeStatusMap[cycle.status] ?? cycle.status}
              />
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                {paymentTypeMap[payment.payment_type] ?? payment.payment_type}
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                {paymentModeMap[payment.payment_mode] ?? payment.payment_mode}
              </Badge>
              {cycle.is_current_cycle && (
                <Badge variant="outline" className="rounded-full px-3 py-1 text-xs text-primary">
                  Mês atual
                </Badge>
              )}
              {selectionMode && selectable && (
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                  <Checkbox
                    checked={selected}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="pointer-events-none"
                  />
                  Selecionar
                </span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{payment.offer_name}</h3>
              <p className="text-sm text-muted-foreground">{payment.course_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-primary/10 p-2.5 text-primary">
            <PixIcon />
            {cycle.status === 'paid' && (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Valor</p>
            <p className="text-base font-semibold text-foreground">
              {formatCurrency(cycle.amount_due)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Período</p>
            <p className="text-sm font-medium text-foreground">
              {formatDate(cycle.period_start)} até {formatDate(cycle.period_end)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Mensalidade</p>
            <p className="text-sm font-medium text-foreground">
              {cycle.cycle_number}
              {cycleTotal ? ` de ${cycleTotal}` : ''}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
          <span className="text-sm text-muted-foreground">
            Pedido #{payment.order_id}
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            Ver pagamento
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Card>
  )

  if (selectionMode && selectable) {
    return (
      <div
        className="h-full"
        role="checkbox"
        aria-checked={selected}
        tabIndex={0}
        onClick={() => onToggle(cycle.cycle_number)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onToggle(cycle.cycle_number)
          }
        }}
      >
        {card}
      </div>
    )
  }

  if (cycle.payment_available === false) {
    return (
      <div className="group/locked relative h-full">
        <div aria-hidden="true" className="h-full select-none">
          {card}
        </div>
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-background/85 p-5 text-center backdrop-blur-[2px]">
          <div className="flex flex-col items-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-sm">
              <LockKeyhole className="h-5 w-5" />
            </div>
            {selectable && (
              <Button
                type="button"
                size="sm"
                className="mt-4 opacity-100 transition-opacity sm:opacity-0 sm:group-hover/locked:opacity-100 sm:group-focus-within/locked:opacity-100"
                onClick={() => onStartAdvance(cycle.cycle_number)}
              >
                Antecipar
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Link
      href={`/financeiro/pagamentos/${payment.order_id}?payment_type=pix&cycle_number=${cycle.cycle_number}`}
      aria-label={`Ver ciclo ${cycle.cycle_number} do pedido ${payment.order_id}`}
      className="block h-full"
    >
      {card}
    </Link>
  )
}

function MonthlyPixPaymentCarousel({ payment }: { payment: PendingPayment }) {
  const router = useRouter()
  const cycles = useMemo(
    () => [...(payment.payment_cycles ?? [])]
      .sort((a, b) => a.cycle_number - b.cycle_number),
    [payment.payment_cycles]
  )
  const currentCycleIndex = Math.max(
    cycles.findIndex((cycle) => cycle.is_current_cycle),
    0
  )
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [selectedCycleIndex, setSelectedCycleIndex] = useState(currentCycleIndex)
  const [advanceMode, setAdvanceMode] = useState(false)
  const [selectedCycleNumbers, setSelectedCycleNumbers] = useState<Set<number>>(
    () => new Set()
  )
  const [showPaymentMethods, setShowPaymentMethods] = useState(false)

  useEffect(() => {
    if (!carouselApi) return

    const updateSelectedCycle = () => {
      setSelectedCycleIndex(carouselApi.selectedScrollSnap())
    }

    carouselApi.scrollTo(currentCycleIndex, true)
    updateSelectedCycle()
    carouselApi.on('select', updateSelectedCycle)
    carouselApi.on('reInit', updateSelectedCycle)

    return () => {
      carouselApi.off('select', updateSelectedCycle)
      carouselApi.off('reInit', updateSelectedCycle)
    }
  }, [carouselApi, currentCycleIndex])

  if (cycles.length === 0) return null

  const selectedCycle = cycles[selectedCycleIndex] ?? cycles[currentCycleIndex]
  const currentCycle = cycles[currentCycleIndex]
  const advanceableCycles = cycles.filter(
    (cycle) =>
      cycle.cycle_number > currentCycle.cycle_number &&
      cycle.status !== 'paid'
  )
  const selectedCycles = advanceableCycles.filter((cycle) =>
    selectedCycleNumbers.has(cycle.cycle_number)
  )
  const selectedTotal = selectedCycles.reduce(
    (total, cycle) => total + Number(cycle.amount_due),
    0
  )

  const startAdvanceSelection = (cycleNumber: number) => {
    setAdvanceMode(true)
    setShowPaymentMethods(false)
    setSelectedCycleNumbers(new Set([cycleNumber]))
  }

  const toggleCycle = (cycleNumber: number) => {
    setShowPaymentMethods(false)
    setSelectedCycleNumbers((current) => {
      const next = new Set(current)
      if (next.has(cycleNumber)) {
        next.delete(cycleNumber)
      } else {
        next.add(cycleNumber)
      }
      return next
    })
  }

  const cancelAdvanceSelection = () => {
    setAdvanceMode(false)
    setShowPaymentMethods(false)
    setSelectedCycleNumbers(new Set())
  }

  const openAdvancePayment = (billingMethod: 'pix' | 'credit_card') => {
    const cycleNumbers = selectedCycles
      .map((cycle) => cycle.cycle_number)
      .sort((a, b) => a - b)

    if (cycleNumbers.length === 0) return

    const query = new URLSearchParams({
      advance_payment: 'true',
      payment_type: billingMethod,
      cycle_numbers: cycleNumbers.join(','),
    })

    router.push(`/financeiro/pagamentos/${payment.order_id}?${query.toString()}`)
  }

  return (
    <div className="min-w-0 space-y-3 xl:col-span-2">
      <Carousel
        setApi={setCarouselApi}
        opts={{
          align: 'center',
          containScroll: 'trimSnaps',
          startIndex: currentCycleIndex,
        }}
        className="w-full"
        aria-label={`Ciclos de pagamento do pedido ${payment.order_id}`}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full px-3 py-1">
              Mês atual: ciclo {currentCycle.cycle_number}
            </Badge>
            <span className="text-xs text-muted-foreground" aria-live="polite">
              Exibindo ciclo {selectedCycle.cycle_number}
            </span>
          </div>

          {cycles.length > 1 && (
            <div className="flex shrink-0 items-center gap-2">
              <CarouselPrevious
                className="static size-9 translate-y-0"
                aria-label="Ver ciclo anterior"
              />
              <CarouselNext
                className="static size-9 translate-y-0"
                aria-label="Ver próximo ciclo"
              />
            </div>
          )}
        </div>

        <CarouselContent className="-ml-4">
          {cycles.map((cycle) => (
            <CarouselItem
              key={`${payment.order_id}-${cycle.cycle_number}`}
              className="pl-4 md:basis-1/2 xl:basis-1/3"
            >
              <MonthlyPixCycleCard
                payment={payment}
                cycle={cycle}
                selectionMode={advanceMode}
                selected={selectedCycleNumbers.has(cycle.cycle_number)}
                selectable={advanceableCycles.some(
                  (advanceableCycle) =>
                    advanceableCycle.cycle_number === cycle.cycle_number
                )}
                onStartAdvance={startAdvanceSelection}
                onToggle={toggleCycle}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {advanceMode && (
        <Card className="border-primary/20 bg-primary/5 p-4 shadow-none">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Antecipar mensalidades</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {selectedCycles.length > 0
                  ? `${selectedCycles.length} ciclo${selectedCycles.length === 1 ? '' : 's'} selecionado${selectedCycles.length === 1 ? '' : 's'} · ${formatCurrency(selectedTotal)}`
                  : 'Selecione pelo menos um ciclo futuro.'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={cancelAdvanceSelection}>
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={selectedCycles.length === 0}
                onClick={() => setShowPaymentMethods(true)}
              >
                Pagar
              </Button>
            </div>
          </div>

          {showPaymentMethods && selectedCycles.length > 0 && (
            <div className="mt-4 border-t border-primary/15 pt-4">
              <p className="text-sm font-medium">Como deseja pagar?</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 justify-start bg-background"
                  onClick={() => openAdvancePayment('pix')}
                >
                  <PixIcon />
                  Pix
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 justify-start bg-background"
                  onClick={() => openAdvancePayment('credit_card')}
                >
                  <CreditCard className="h-5 w-5" />
                  Cartão de crédito
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

export default function FinanceiroPage() {
  const {
    data: contractedOffers,
    error: currentOfferError,
    isLoading: isLoadingCurrentOffer,
  } = useCurrentContractedOffer()
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const selectedOffer = useMemo(
    () => contractedOffers?.find((offer) => offer.order_id === selectedOrderId) ?? contractedOffers?.[0],
    [contractedOffers, selectedOrderId]
  )
  const {
    data: pendingPayments,
    error: pendingPaymentsError,
    isLoading: isLoadingPendingPayments,
  } = usePendingPayments(selectedOffer?.order_id ?? null)

  useEffect(() => {
    if (!contractedOffers?.length) return

    if (selectedOrderId && contractedOffers.some((offer) => offer.order_id === selectedOrderId)) {
      return
    }

    setSelectedOrderId(contractedOffers[0].order_id)
  }, [contractedOffers, selectedOrderId])

  const isLoading = isLoadingCurrentOffer || isLoadingPendingPayments
  const hasError = currentOfferError || pendingPaymentsError
  const hasMultipleOffers = (contractedOffers?.length ?? 0) > 1
  const visiblePendingCount = pendingPayments.reduce((count, payment) => {
    if (
      payment.payment_type === 'pix' &&
      payment.payment_mode === 'monthly' &&
      payment.payment_cycles?.length
    ) {
      return count + getVisiblePaymentCycles(payment.payment_cycles)
        .filter((cycle) => cycle.status !== 'paid').length
    }

    return count + (pendingCheckoutStatuses.has(payment.checkout_status) ? 1 : 0)
  }, 0)

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LogoPulseLoader label="Carregando dados financeiros..." />
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-sm text-destructive">
          Erro ao carregar dados financeiros: {hasError.message}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary/70">
            Financeiro
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {hasMultipleOffers ? 'Planos contratado e pagamentos' : 'Plano contratado e pagamentos'}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Acompanhe o plano atual, turma vinculada e cobranças pendentes.
          </p>
        </div>
        {hasMultipleOffers && (
          <div className="space-y-1.5 self-start sm:self-auto">
            <label className="text-xs font-medium text-muted-foreground">Selecionar plano</label>
            <Select
              value={selectedOffer?.order_id.toString()}
              onValueChange={(value) => setSelectedOrderId(Number(value))}
            >
              <SelectTrigger className="h-11 w-full shadow-sm sm:w-[320px]">
                <SelectValue placeholder="Selecionar plano" />
              </SelectTrigger>
              <SelectContent>
                {contractedOffers?.map((offer) => (
                  <SelectItem key={offer.order_id} value={offer.order_id.toString()}>
                    <div className="flex items-center gap-2.5">
                      <OfferStatusDot status={offer.checkout_status} />
                      <span>{offer.offer.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {selectedOffer ? (
        <Card className="overflow-hidden border-border/60 shadow-sm">
          <div className="border-b border-border/50 bg-gradient-to-r from-[#2462EB]/10 via-background to-background px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-border/60">
                  <Image
                    src={selectedOffer.icon}
                    alt={selectedOffer.course_name}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-foreground">
                      {selectedOffer.offer.name}
                    </h2>
                    <StatusBadge
                      value={selectedOffer.checkout_status}
                      label={
                        checkoutStatusMap[selectedOffer.checkout_status] ??
                        selectedOffer.checkout_status
                      }
                    />
                    {selectedOffer.contract?.contract_file_url && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={selectedOffer.contract.contract_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-primary shadow-sm transition-colors hover:bg-primary/10"
                            aria-label="Ver contrato"
                          >
                            <FileText className="h-4 w-4" />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={8}>Ver contrato</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedOffer.course_name} • {selectedOffer.offer.course.language_name} •{' '}
                    Nível {selectedOffer.offer.course.level_name}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Valor do plano
                </p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {formatCurrency(selectedOffer.offer.price)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 lg:grid-cols-2">
            <Card className="border-border/60 bg-muted/20 p-5 shadow-none">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Resumo do curso
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Curso</p>
                  <p className="text-base font-medium text-foreground">
                    {selectedOffer.course_name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Turma</p>
                  <p className="text-base font-medium text-foreground">
                    {selectedOffer.student_class?.class_name ?? 'Não vinculada'}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Início</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(selectedOffer.student_class?.start_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fim</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(selectedOffer.student_class?.finish_date)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-border/60 bg-muted/20 p-5 shadow-none">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Agenda da turma
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background px-4 py-3">
                  <Clock3 className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Horário</p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedOffer.student_class?.time ?? 'Não informado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background px-4 py-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Dias da semana</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatWeekdays(selectedOffer.student_class?.days_of_week)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background px-4 py-3">
                  <Wallet className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Acesso contratado</p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedOffer.offer.access_duration_days
                        ? `${selectedOffer.offer.access_duration_days} dias de acesso`
                        : 'Não informado'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Card>
      ) : (
        <Card className="border-dashed border-border/60 p-8 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Nenhum plano contratado encontrado</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Assim que houver um plano vinculado, ele aparecerá aqui.
          </p>
        </Card>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Pagamentos</h2>

          </div>
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {visiblePendingCount} pendente{visiblePendingCount === 1 ? '' : 's'}
          </Badge>
        </div>

        {pendingPayments.length === 0 ? (
          <Card className="border-dashed border-border/60 p-8 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-emerald-600" />
            <h3 className="text-lg font-semibold">Nenhum pagamento pendente</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Quando houver cobranças em aberto, elas aparecerão nesta seção.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {pendingPayments.map((payment) => {
              if (
                payment.payment_type === 'pix' &&
                payment.payment_mode === 'monthly' &&
                payment.payment_cycles?.length
              ) {
                return (
                  <MonthlyPixPaymentCarousel
                    key={payment.order_id}
                    payment={payment}
                  />
                )
              }

              return (
                <Link
                  key={payment.order_id}
                  href={`/financeiro/pagamentos/${payment.order_id}?payment_type=${payment.payment_type}`}
                >
                <Card className="group h-full border-border/60 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                          value={payment.checkout_status}
                          label={
                            payment.checkout_status === 'active'
                              ? 'Pago'
                              : checkoutStatusMap[payment.checkout_status] ?? payment.checkout_status
                          }
                        />
                        <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                          {paymentTypeMap[payment.payment_type] ?? payment.payment_type}
                        </Badge>
                        <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                          {paymentModeMap[payment.payment_mode] ?? payment.payment_mode}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {payment.offer_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{payment.course_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-primary/10 p-2.5 text-primary">
                      {payment.payment_type === 'pix' ? (
                        <PixIcon />
                      ) : (
                        <CreditCard className="h-5 w-5" />
                      )}
                      {payment.checkout_status === 'active' && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      )}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Valor</p>
                      <p className="text-base font-semibold text-foreground">
                        {formatCurrency(payment.value)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Período</p>
                      <p className="text-sm font-medium text-foreground">
                        {formatDate(payment.current_period_start)} até{' '}
                        {formatDate(payment.current_period_end)}
                      </p>
                    </div>
                    {!(payment.payment_type === 'pix' && payment.payment_mode === 'one_time') && (
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {payment.payment_mode === 'monthly' ? 'Mensalidade' : 'Parcelamento'}
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {payment.payment_mode === 'monthly'
                            ? payment.pending_cycle_number && payment.pending_cycle_total
                              ? `${payment.pending_cycle_number} de ${payment.pending_cycle_total}`
                              : 'Não informado'
                            : payment.installments
                              ? `${payment.installments}x`
                              : 'À vista'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
                    <span className="text-sm text-muted-foreground">
                      Pedido #{payment.order_id}
                    </span>
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                      Ver pagamento
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Card>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
