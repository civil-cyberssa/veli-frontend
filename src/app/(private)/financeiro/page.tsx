'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  Wallet,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
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
  formatCurrency,
  formatDate,
  formatWeekdays,
  paymentModeMap,
  paymentTypeMap,
} from '@/src/features/finance/utils'

const statusToneMap: Record<string, string> = {
  pending_payment: 'bg-amber-100 text-amber-800 border-amber-200',
  pending_contract: 'bg-slate-100 text-slate-700 border-slate-200',
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  pending_signature: 'bg-amber-100 text-amber-800 border-amber-200',
}

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
          <div className="border-b border-border/50 bg-gradient-to-r from-[#109697]/10 via-background to-background px-6 py-5">
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
            {pendingPayments.length} pendente{pendingPayments.length === 1 ? '' : 's'}
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
            {pendingPayments.map((payment) => (
              <Link key={payment.order_id} href={`/financeiro/pagamentos/${payment.order_id}`}>
                <Card className="group h-full border-border/60 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                          value={payment.checkout_status}
                          label={
                            checkoutStatusMap[payment.checkout_status] ?? payment.checkout_status
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
                    <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                      {payment.payment_type === 'pix' ? (
                        <PixIcon />
                      ) : (
                        <CreditCard className="h-5 w-5" />
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
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
