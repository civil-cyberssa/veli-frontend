'use client'

import { use, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  CalendarRange,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Landmark,
  Loader2,
  QrCode,
  Receipt,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LogoPulseLoader } from '@/components/shared/logo-loader'
import { useStudentProfile } from '@/src/features/profile/hooks/use-student-profile'
import {
  useOrderPaymentStatus,
  usePendingPayment,
  useStartPayment,
} from '@/src/features/finance/hooks/useFinanceData'
import type {
  PendingPayment,
  StartPaymentPayload,
  StartPaymentResponse,
} from '@/src/features/finance/types'
import {
  chargeStatusMap,
  checkoutStatusMap,
  contractStatusMap,
  digitsOnly,
  formatCardNumber,
  formatCurrency,
  formatDate,
  formatExpiry,
  paymentModeMap,
  paymentTypeMap,
} from '@/src/features/finance/utils'

interface PaymentDetailsPageProps {
  params: Promise<{
    orderId: string
  }>
}

type FocusField = 'number' | 'name' | 'cvv' | 'expiry' | ''

interface CardFormState {
  cardName: string
  cardNumber: string
  cvv: string
  expirationDate: string
  holderIsCustomer: boolean
  holderName: string
  holderEmail: string
  holderPostalCode: string
  holderAddressNumber: string
  holderPhone: string
}

const initialFormState: CardFormState = {
  cardName: '',
  cardNumber: '',
  cvv: '',
  expirationDate: '',
  holderIsCustomer: true,
  holderName: '',
  holderEmail: '',
  holderPostalCode: '',
  holderAddressNumber: '',
  holderPhone: '',
}

const statusToneMap: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  pending_contract: 'bg-slate-100 text-slate-700 border-slate-200',
  pending_payment: 'bg-amber-100 text-amber-800 border-amber-200',
  processing: 'bg-sky-100 text-sky-800 border-sky-200',
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  canceled: 'bg-rose-100 text-rose-800 border-rose-200',
  expired: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  pending_signature: 'bg-amber-100 text-amber-800 border-amber-200',
}

function normalizeCardBrand(brand?: string | null) {
  const normalized = brand?.trim().toLowerCase() ?? ''

  if (normalized === 'visa') return 'VISA'
  if (normalized === 'mastercard' || normalized === 'master card') return 'MASTERCARD'
  if (
    normalized === 'amex' ||
    normalized === 'american express' ||
    normalized === 'americanexpress'
  ) {
    return 'AMEX'
  }
  if (normalized === 'discover') return 'DISCOVER'

  return 'CRÉDITO'
}

function CardBrandLogo({ brand }: { brand: string }) {
  const normalizedBrand = normalizeCardBrand(brand)

  if (normalizedBrand === 'VISA') {
    return (
      <div className="flex h-10 w-16 items-center justify-center rounded-xl bg-white/95 px-3 shadow-sm">
        <svg viewBox="0 0 64 24" className="h-5 w-12" aria-label="Visa">
          <path fill="#1434CB" d="M25.9 18.4h-4l2.5-12.8h4l-2.5 12.8zm16.8-12.5a10.2 10.2 0 0 0-3.6-.6c-4 0-6.8 2.1-6.8 5.1 0 2.2 2 3.5 3.5 4.2 1.6.8 2.1 1.3 2.1 2 0 1.1-1.3 1.6-2.5 1.6-1.7 0-2.6-.3-4-.9l-.5-.2-.6 3.5a13.6 13.6 0 0 0 4.7.9c4.2 0 7-2.1 7-5.3 0-1.8-1.1-3.1-3.4-4.2-1.4-.7-2.3-1.1-2.3-1.8 0-.6.7-1.3 2.3-1.3 1.3 0 2.3.3 3 .6l.4.2.7-3.4zM53 5.6h-3.1c-1 0-1.7.3-2.1 1.3l-5.9 11.5h4.2l.8-2.3h5.2l.5 2.3H56L53 5.6zm-5 7.3 2.1-5.8 1.2 5.8H48zM20.2 5.6l-3.9 8.7-.4-2A9.8 9.8 0 0 0 11 6.4l3.6 12h4.3L25.3 5.6h-5.1z"/>
          <path fill="#F7A600" d="M14.6 5.6H8.1L8 5.9c5 1.3 7.6 4.5 7.9 6.4l-1.3-5.9z"/>
        </svg>
      </div>
    )
  }

  if (normalizedBrand === 'MASTERCARD') {
    return (
      <div className="flex h-10 w-16 items-center justify-center rounded-xl bg-white/95 px-3 shadow-sm">
        <svg viewBox="0 0 64 40" className="h-6 w-12" aria-label="Mastercard">
          <circle cx="24" cy="20" r="12" fill="#EB001B" />
          <circle cx="40" cy="20" r="12" fill="#F79E1B" />
          <path fill="#FF5F00" d="M32 10.4A15 15 0 0 0 32 29.6A15 15 0 0 0 32 10.4Z" />
        </svg>
      </div>
    )
  }

  if (normalizedBrand === 'AMEX') {
    return (
      <div className="flex h-10 w-16 items-center justify-center rounded-xl bg-[#2E77BC] px-2 shadow-sm">
        <svg viewBox="0 0 64 24" className="h-5 w-12" aria-label="American Express">
          <path fill="#fff" d="M5 6h14l1.3 1.5L21.6 6H59v12H21.6L20.3 16.5 19 18H5V6Zm4 2.4v7.2h3v-2.4h2.5l1.9 2.4h3.6l-2.2-2.7c1.1-.4 1.8-1.2 1.8-2.3 0-1.7-1.4-2.2-3-2.2H9Zm3 2h3.4c.6 0 1 .1 1 .7s-.4.8-1 .8H12v-1.5Zm11.2-2-3.4 7.2h3.1l.4-1h3.5l.4 1h3.2l-3.4-7.2h-3.8Zm3 4.1h-2l1-2.5 1 2.5Zm6.6-4.1v7.2h7.7v-2.1h-4.8v-.7h4.7v-2h-4.7v-.7h4.8V8.4h-7.7Zm8.8 0v7.2h3V12l3 3.6h2.8l3-3.6v3.6h3V8.4h-3.7l-3.7 4.3-3.7-4.3h-3.7Z"/>
        </svg>
      </div>
    )
  }

  if (normalizedBrand === 'DISCOVER') {
    return (
      <div className="flex h-10 w-16 items-center justify-center rounded-xl bg-white/95 px-2 shadow-sm">
        <svg viewBox="0 0 64 24" className="h-5 w-12" aria-label="Discover">
          <path fill="#000" d="M6 8.1h4.2c2.4 0 4.1 1.5 4.1 3.9 0 2.4-1.7 4-4.1 4H6V8.1Zm2.2 1.8v4.3h1.8c1.2 0 2-.8 2-2.2 0-1.3-.8-2.1-2-2.1H8.2Zm7.6-1.8h6v1.8h-3.8V11h3.7v1.8h-3.7v1.3h3.8v1.8h-6V8.1Zm7.1 0h2.2v7.8h-2.2V8.1Zm3.2 0h2.1l3.1 4.4V8.1h2.2v7.8h-2.1l-3.1-4.4v4.4h-2.2V8.1Zm8.7 0H41v1.8h-3.8V11h3.7v1.8h-3.7v1.3H41v1.8h-6V8.1Zm6.8 0h2.2v6h3.4v1.8h-5.6V8.1Zm5.9 0h6.4v1.8h-4.2v1.2h4v1.7h-4v3h-2.2V8.1Z"/>
          <path fill="#F48120" d="M57 12c-1.4 0-2.7.6-3.5 1.5h6.9A4.8 4.8 0 0 0 57 12Z"/>
        </svg>
      </div>
    )
  }

  return (
    <div className="flex h-10 w-16 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/90 shadow-sm backdrop-blur-sm">
      Card
    </div>
  )
}

function StatusBadge({ value, label }: { value: string; label: string }) {
  return (
    <Badge
      variant="outline"
      className={`${statusToneMap[value] ?? 'bg-slate-100 text-slate-700 border-slate-200'} rounded-full px-3 py-1 text-xs font-medium`}
    >
      {label}
    </Badge>
  )
}

function detectCardBrand(value: string) {
  const digits = digitsOnly(value)

  if (/^4/.test(digits)) return 'VISA'
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'MASTERCARD'
  if (/^3[47]/.test(digits)) return 'AMEX'
  if (/^6(?:011|5)/.test(digits)) return 'DISCOVER'
  return 'CRÉDITO'
}

function validateForm(payment: PendingPayment, form: CardFormState) {
  const errors: Partial<Record<keyof CardFormState, string>> = {}

  if (!form.cardName.trim()) {
    errors.cardName = 'Informe o nome impresso no cartão.'
  }

  if (digitsOnly(form.cardNumber).length < 13) {
    errors.cardNumber = 'Informe um número de cartão válido.'
  }

  if (digitsOnly(form.cvv).length < 3) {
    errors.cvv = 'Informe um CVV válido.'
  }

  if (!/^\d{2}\/\d{4}$/.test(form.expirationDate)) {
    errors.expirationDate = 'Use o formato MM/AAAA.'
  } else {
    const [month, year] = form.expirationDate.split('/').map(Number)
    if (!month || month < 1 || month > 12) {
      errors.expirationDate = 'Mês de expiração inválido.'
    } else {
      const yearText = form.expirationDate.split('/')[1] ?? ''
      if (!['2', '3'].includes(yearText.charAt(0))) {
        errors.expirationDate = 'Ano de expiração inválido.'
      } else {
        const now = new Date()
        const currentMonth = now.getMonth() + 1
        const currentYear = now.getFullYear()

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          errors.expirationDate = 'A data de expiração não pode ser menor que a atual.'
        }
      }
    }
  }

  if (!form.holderIsCustomer) {
    if (!form.holderName.trim()) errors.holderName = 'Informe o nome do proprietário.'
    if (!form.holderEmail.trim()) errors.holderEmail = 'Informe o email do proprietário.'
    if (!form.holderPostalCode.trim()) errors.holderPostalCode = 'Informe o CEP.'
    if (!form.holderAddressNumber.trim()) {
      errors.holderAddressNumber = 'Informe o número do endereço.'
    }
    if (digitsOnly(form.holderPhone).length < 10) {
      errors.holderPhone = 'Informe o telefone do proprietário.'
    }
  }

  if (!payment.contract?.contract_file_url) {
    errors.cardName = errors.cardName ?? 'Contrato indisponível para aceite.'
  }

  return errors
}

export default function PaymentDetailsPage({ params }: PaymentDetailsPageProps) {
  const orderId = Number(use(params).orderId)
  const searchParams = useSearchParams()
  const { data: payment, error, isLoading } = usePendingPayment(orderId)
  const {
    data: paymentStatus,
    error: paymentStatusError,
    isLoading: isLoadingPaymentStatus,
  } = useOrderPaymentStatus(orderId)
  const { data: profileData, loading: loadingProfile } = useStudentProfile()
  const { startPayment } = useStartPayment()

  const [form, setForm] = useState<CardFormState>(initialFormState)
  const [errors, setErrors] = useState<Partial<Record<keyof CardFormState, string>>>({})
  const [focusedField, setFocusedField] = useState<FocusField>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successResult, setSuccessResult] = useState<StartPaymentResponse | null>(null)
  const [submittedCardBrand, setSubmittedCardBrand] = useState<string>('CRÉDITO')
  const [selectedInstallments, setSelectedInstallments] = useState<string>('')
  const [hasCopiedPix, setHasCopiedPix] = useState(false)

  const latestCharge = paymentStatus?.latest_charge ?? payment?.latest_charge ?? null
  const billingSubscription =
    paymentStatus?.billing_subscription ?? payment?.billing_subscription ?? null
  const checkoutStatus = paymentStatus?.checkout_status ?? payment?.checkout_status ?? ''
  const paymentType = paymentStatus?.payment_type ?? payment?.payment_type ?? ''
  const paymentMode = paymentStatus?.payment_mode ?? payment?.payment_mode ?? ''
  const paymentInstallments = paymentStatus?.installments ?? payment?.installments ?? null
  const isPaid =
    latestCharge?.status === 'paid' || checkoutStatus === 'paid' || checkoutStatus === 'active'
  const pixQrCode = latestCharge?.pix_qr_code ?? null
  const pixCopyPaste = latestCharge?.pix_copy_paste ?? pixQrCode?.payload ?? ''
  const receiptUrl = latestCharge?.payment_receipt_url ?? null
  const paymentValue = payment?.value ?? latestCharge?.amount_gross ?? null
  const isPixPayment = paymentType === 'pix' || latestCharge?.billing_method === 'pix'
  const shouldUsePaymentStatus =
    searchParams.get('payment_type') === 'pix' ||
    isPixPayment ||
    payment?.payment_type === 'pix'
  const isCreditCardPayment =
    ['credit', 'credit_card'].includes(paymentType) ||
    latestCharge?.billing_method === 'credit_card'
  const cardBrand = detectCardBrand(form.cardNumber)
  const isCardBackVisible = focusedField === 'cvv' || focusedField === 'expiry'
  const shortExpiryHint = useMemo(() => {
    if (!/^\d{2}\/\d{2}$/.test(form.expirationDate)) return null

    const [month, year] = form.expirationDate.split('/')
    const firstYearDigit = year.charAt(0)
    if (!['2', '3'].includes(firstYearDigit)) return null

    const fullYear = `20${year}`
    return `Use o formato ${month}/${fullYear}`
  }, [form.expirationDate])
  const allowedInstallments = useMemo(() => {
    if (payment?.allowed_installments?.length) {
      return [...payment.allowed_installments].sort((a, b) => a - b)
    }

    if (paymentInstallments) {
      return [paymentInstallments]
    }

    return [1]
  }, [payment?.allowed_installments, paymentInstallments])

  useEffect(() => {
    if (!profileData) return

    const fullName = `${profileData.user.first_name} ${profileData.user.last_name}`.trim()

    setForm((current) => ({
      ...current,
      cardName: current.cardName || fullName,
      holderName: current.holderName || fullName,
      holderEmail: current.holderEmail || profileData.user.email || '',
      holderPostalCode: current.holderPostalCode || profileData.user.cep || '',
      holderPhone: current.holderPhone || profileData.user.phone || '',
    }))
  }, [profileData])

  useEffect(() => {
    if (!payment) return

    const defaultInstallment = payment.installments && allowedInstallments.includes(payment.installments)
      ? payment.installments
      : allowedInstallments[0]

    setSelectedInstallments(String(defaultInstallment ?? 1))
  }, [allowedInstallments, payment])

  const handleFieldChange =
    (field: keyof CardFormState, formatter?: (value: string) => string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = formatter ? formatter(event.target.value) : event.target.value

      setForm((current) => ({
        ...current,
        [field]: nextValue,
      }))

      setErrors((current) => ({
        ...current,
        [field]: undefined,
      }))
    }

  const paymentPayload = useMemo<StartPaymentPayload | null>(() => {
    if (!payment) return null

    return {
      ...(form.holderIsCustomer
        ? {}
        : {
            holder: {
              name: form.holderName.trim().toUpperCase(),
              email: form.holderEmail.trim(),
              postal_code: digitsOnly(form.holderPostalCode),
              address_number: form.holderAddressNumber.trim(),
              phone: digitsOnly(form.holderPhone),
            },
          }),
      holder_is_customer: form.holderIsCustomer,
      credit_card: {
        name: form.cardName.trim().toUpperCase(),
        number: digitsOnly(form.cardNumber),
        cvv: digitsOnly(form.cvv),
        expiration_date: form.expirationDate,
      },
      installments: Number(selectedInstallments) || 1,
      accept_contract: true,
    }
  }, [form, payment, selectedInstallments])

  const handleSubmit = async () => {
    if (!payment || !paymentPayload) return

    const validationErrors = validateForm(payment, form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      toast.error('Revise os dados do pagamento.')
      return
    }

    setIsSubmitting(true)

    try {
      setSubmittedCardBrand(cardBrand)
      const response = await startPayment(payment.order_id, paymentPayload)
      setSuccessResult(response)
      toast.success('Pagamento processado com sucesso.')
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : 'Não foi possível processar o pagamento.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyPix = async () => {
    if (!pixCopyPaste) return

    try {
      await navigator.clipboard.writeText(pixCopyPaste)
      setHasCopiedPix(true)
      toast.success('Código Pix copiado.')
      window.setTimeout(() => setHasCopiedPix(false), 2500)
    } catch {
      toast.error('Não foi possível copiar o código Pix.')
    }
  }

  if (
    (isLoading && isLoadingPaymentStatus) ||
    (shouldUsePaymentStatus && isLoadingPaymentStatus && !paymentStatus) ||
    loadingProfile
  ) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LogoPulseLoader label="Carregando pagamento..." />
      </div>
    )
  }

  if (
    (error && paymentStatusError && !paymentStatus) ||
    (shouldUsePaymentStatus && paymentStatusError && !paymentStatus)
  ) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-sm text-destructive">
          Erro ao carregar pagamento: {paymentStatusError.message || error.message}
        </p>
      </div>
    )
  }

  if (!payment && !paymentStatus) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Pagamento não encontrado</h1>
        <p className="text-sm text-muted-foreground">
          Não foi possível localizar esse pedido entre os pagamentos pendentes.
        </p>
        <Button asChild variant="outline">
          <Link href="/financeiro">Voltar ao financeiro</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary/70">
            Pagamento
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Pedido #{payment?.order_id ?? paymentStatus?.order_id ?? orderId}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Consulte os dados da cobrança e conclua o pagamento quando o método exigir cartão.
            {isPixPayment && !isPaid ? ' O status do Pix é atualizado automaticamente.' : ''}
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/financeiro">Voltar ao financeiro</Link>
        </Button>
      </div>

      <Card className="border-border/60 p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                value={checkoutStatus}
                label={checkoutStatusMap[checkoutStatus] ?? checkoutStatus}
              />
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                {paymentTypeMap[paymentType] ?? paymentType}
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                {paymentModeMap[paymentMode] ?? paymentMode}
              </Badge>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">
                {payment?.offer_name ?? `Pedido #${orderId}`}
              </h2>
              {payment?.course_name && (
                <p className="text-sm text-muted-foreground">{payment.course_name}</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            {isPaid ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : isPixPayment ? (
              <QrCode className="h-6 w-6" />
            ) : (
              <CreditCard className="h-6 w-6" />
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">Valor</p>
            <p className="mt-1 text-2xl font-semibold">{formatCurrency(paymentValue)}</p>
          </div>
          {!isPixPayment && (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Parcelamento</p>
              <p className="mt-1 text-base font-semibold">
                {paymentInstallments ? `${paymentInstallments}x` : 'À vista'}
              </p>
            </div>
          )}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">Status da cobrança</p>
            <p className="mt-1 text-base font-semibold">
              {checkoutStatus === 'pending_payment'
                ? checkoutStatusMap.pending_payment
                : chargeStatusMap[latestCharge?.status ?? ''] ??
                latestCharge?.status ??
                'Não informado'}
            </p>
          </div>
          {isPixPayment && billingSubscription?.next_due_date && (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Próxima data de pagamento</p>
              <p className="mt-1 text-base font-semibold">
                {formatDate(billingSubscription.next_due_date)}
              </p>
            </div>
          )}
        </div>

        {payment && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="flex gap-3 rounded-xl border border-border/60 p-4">
              <CalendarRange className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Período de vigência</p>
                <p className="text-sm font-medium">
                  {formatDate(payment.current_period_start)} até {formatDate(payment.current_period_end)}
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border border-border/60 p-4">
              <Landmark className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Contrato</p>
                <p className="text-sm font-medium">
                  {contractStatusMap[payment.contract?.status ?? ''] ??
                    payment.contract?.status ??
                    'Não informado'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {isCreditCardPayment && payment ? (
        successResult ? (
          <Card className="border-border/60 p-8 shadow-sm">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <div className="success-ring relative mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-emerald-50">
                <div className="success-check flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
              </div>

              <Badge className="mb-4 rounded-full bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-600">
                Pagamento realizado
              </Badge>
              <h2 className="text-2xl font-semibold">Pagamento confirmado</h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                O cartão foi processado com sucesso. Os dados abaixo vieram da confirmação da transação.
              </p>

              <div className="mt-6 grid w-full gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-left">
                  <p className="text-xs text-muted-foreground">Cobrado agora</p>
                  <p className="mt-1 text-xl font-semibold">
                    {formatCurrency(successResult.raw.value)}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-left">
                  <p className="text-xs text-muted-foreground">Bandeira</p>
                  <div className="mt-2">
                    <CardBrandLogo
                      brand={
                        successResult.raw.creditCard?.creditCardBrand ??
                        submittedCardBrand ??
                        cardBrand
                      }
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-left">
                  <p className="text-xs text-muted-foreground">Cartão final</p>
                  <p className="mt-1 text-base font-semibold">
                    **** {successResult.raw.creditCard?.creditCardNumber ?? '----'}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-left">
                  <p className="text-xs text-muted-foreground">Status do gateway</p>
                  <p className="mt-1 text-base font-semibold">{successResult.raw.status}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {successResult.raw.invoiceUrl && (
                  <Button asChild>
                    <a href={successResult.raw.invoiceUrl} target="_blank" rel="noopener noreferrer">
                      Ver comprovante
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {successResult.raw.transactionReceiptUrl && (
                  <Button asChild variant="outline">
                    <a
                      href={successResult.raw.transactionReceiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Abrir recibo
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="overflow-hidden border-border/60 p-6 shadow-sm">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary/70">
                    Cartão
                  </p>
                </div>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                  <CardBrandLogo brand={cardBrand} />
                </Badge>
              </div>

              <div className="perspective-[1200px] mx-auto w-full max-w-md">
                <div
                  className={`relative h-64 w-full transition-transform duration-700 [transform-style:preserve-3d] ${isCardBackVisible ? '[transform:rotateY(180deg)]' : ''}`}
                >
                  <div className="absolute inset-0 [backface-visibility:hidden]">
                    <div className="relative h-full overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#073b56_0%,#109697_45%,#8ce8de_100%)] p-6 text-white shadow-[0_26px_70px_rgba(10,54,79,0.28)]">
                      <div className="absolute -left-10 top-6 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
                      <div className="absolute -right-8 bottom-2 h-32 w-32 rounded-full bg-[#d9fff9]/20 blur-2xl" />
                      <div className="relative flex h-full flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div className="rounded-xl border border-white/20 bg-white/15 px-3 py-2 backdrop-blur-sm">
                            <p className="text-[10px] uppercase tracking-[0.28em] text-white/70">
                              Cartão digital
                            </p>
                            <div className="mt-2">
                              <CardBrandLogo brand={cardBrand} />
                            </div>
                          </div>
                          <div className="flex h-12 w-16 items-center justify-center rounded-2xl border border-white/25 bg-gradient-to-br from-white/40 to-white/10">
                            <CardBrandLogo brand={cardBrand} />
                          </div>
                        </div>

                        <div className="space-y-5">
                          <div>
                            <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-white/70">
                              Número
                            </p>
                            <p className="text-2xl font-semibold tracking-[0.22em]">
                              {formatCardNumber(form.cardNumber) || '•••• •••• •••• ••••'}
                            </p>
                          </div>

                          <div className="flex items-end justify-between gap-4">
                            <div className="min-w-0">
                              <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-white/70">
                                Titular
                              </p>
                              <p className="truncate text-base font-semibold uppercase">
                                {form.cardName || 'NOME DO CARTÃO'}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-white/70">
                                Expira
                              </p>
                              <p className="text-base font-semibold">
                                {form.expirationDate || 'MM/AAAA'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <div className="relative flex h-full overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#062d43_0%,#0d6071_52%,#073b56_100%)] p-0 text-white shadow-[0_26px_70px_rgba(10,54,79,0.28)]">
                      <div className="absolute left-0 top-8 h-12 w-full bg-black/70" />
                      <div className="absolute right-6 top-28 flex h-12 w-40 items-center justify-end rounded-md bg-white/90 px-4 text-right text-slate-900 shadow-sm">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                            CVV
                          </p>
                          <p className="text-lg font-semibold tracking-[0.28em]">
                            {form.cvv || '•••'}
                          </p>
                        </div>
                      </div>
                      <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.28em] text-white/70">
                            Expiração
                          </p>
                          <p className="mt-2 text-base font-semibold">
                            {form.expirationDate || 'MM/AAAA'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] uppercase tracking-[0.28em] text-white/70">
                            Titular
                          </p>
                          <p className="mt-2 max-w-40 truncate text-base font-semibold uppercase">
                            {form.cardName || 'NOME DO CARTÃO'}
                          </p>
                        </div>
                      </div>
                      <div className="absolute right-6 top-4">
                        <CardBrandLogo brand={cardBrand} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden border-border/60 p-0 shadow-sm">
              <div className="border-b border-border/50 bg-gradient-to-r from-primary/10 via-background to-background px-6 py-5">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary/70">
                  Pagamento com cartão
                </p>
                <h2 className="mt-2 text-xl font-semibold">Preencha os dados do cartão</h2>
              </div>

              <div className="space-y-6 px-6 py-6">
                <div className="payment-fields grid gap-4 md:grid-cols-2">
                  <div className="field-animate md:col-span-2">
                    <Label htmlFor="cardName">Nome no cartão</Label>
                    <Input
                      id="cardName"
                      value={form.cardName}
                      onChange={handleFieldChange('cardName')}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField('')}
                      placeholder="JOAO DA SILVA"
                      className="mt-2 h-11"
                    />
                    {errors.cardName && <p className="mt-1 text-xs text-destructive">{errors.cardName}</p>}
                  </div>

                  <div className="field-animate md:col-span-2">
                    <Label htmlFor="cardNumber">Número do cartão</Label>
                    <Input
                      id="cardNumber"
                      value={form.cardNumber}
                      onChange={handleFieldChange('cardNumber', formatCardNumber)}
                      onFocus={() => setFocusedField('number')}
                      onBlur={() => setFocusedField('')}
                      placeholder="4111 1111 1111 1111"
                      className="mt-2 h-11 tracking-[0.24em]"
                      inputMode="numeric"
                    />
                    {errors.cardNumber && (
                      <p className="mt-1 text-xs text-destructive">{errors.cardNumber}</p>
                    )}
                  </div>

                  <div className="field-animate">
                    <Label htmlFor="expirationDate">Data de expiração</Label>
                    <Input
                      id="expirationDate"
                      value={form.expirationDate}
                      onChange={handleFieldChange('expirationDate', formatExpiry)}
                      onFocus={() => setFocusedField('expiry')}
                      onBlur={() => setFocusedField('')}
                      placeholder="12/2030"
                      className="mt-2 h-11"
                      inputMode="numeric"
                    />
                    {errors.expirationDate && (
                      <p className="mt-1 text-xs text-destructive">{errors.expirationDate}</p>
                    )}
                    {!errors.expirationDate && shortExpiryHint && (
                      <p className="mt-1 text-xs text-muted-foreground">{shortExpiryHint}</p>
                    )}
                  </div>

                  <div className="field-animate">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={form.cvv}
                      onChange={handleFieldChange('cvv', (value) => digitsOnly(value).slice(0, 4))}
                      onFocus={() => setFocusedField('cvv')}
                      onBlur={() => setFocusedField('')}
                      placeholder="123"
                      className="mt-2 h-11"
                      inputMode="numeric"
                    />
                    {errors.cvv && <p className="mt-1 text-xs text-destructive">{errors.cvv}</p>}
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="holderIsCustomer"
                      checked={form.holderIsCustomer}
                      onCheckedChange={(checked) =>
                        setForm((current) => ({
                          ...current,
                          holderIsCustomer: checked === true,
                        }))
                      }
                      className="mt-0.5"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="holderIsCustomer">
                        Os dados do proprietário do cartão são os meus
                      </Label>
                    </div>
                  </div>

                  {!form.holderIsCustomer && (
                    <div className="holder-fields mt-5 grid gap-4 md:grid-cols-2">
                      <div className="field-animate md:col-span-2">
                        <Label htmlFor="holderName">Nome do proprietário</Label>
                        <Input
                          id="holderName"
                          value={form.holderName}
                          onChange={handleFieldChange('holderName')}
                          placeholder="JOAO DA SILVA"
                          className="mt-2 h-11"
                        />
                        {errors.holderName && (
                          <p className="mt-1 text-xs text-destructive">{errors.holderName}</p>
                        )}
                      </div>

                      <div className="field-animate">
                        <Label htmlFor="holderEmail">Email</Label>
                        <Input
                          id="holderEmail"
                          value={form.holderEmail}
                          onChange={handleFieldChange('holderEmail')}
                          placeholder="joao@email.com"
                          className="mt-2 h-11"
                          type="email"
                        />
                        {errors.holderEmail && (
                          <p className="mt-1 text-xs text-destructive">{errors.holderEmail}</p>
                        )}
                      </div>

                      <div className="field-animate">
                        <Label htmlFor="holderPhone">Telefone</Label>
                        <Input
                          id="holderPhone"
                          value={form.holderPhone}
                          onChange={handleFieldChange('holderPhone', (value) => digitsOnly(value).slice(0, 11))}
                          placeholder="71992997191"
                          className="mt-2 h-11"
                          inputMode="numeric"
                        />
                        {errors.holderPhone && (
                          <p className="mt-1 text-xs text-destructive">{errors.holderPhone}</p>
                        )}
                      </div>

                      <div className="field-animate">
                        <Label htmlFor="holderPostalCode">CEP</Label>
                        <Input
                          id="holderPostalCode"
                          value={form.holderPostalCode}
                          onChange={handleFieldChange('holderPostalCode', (value) => digitsOnly(value).slice(0, 8))}
                          placeholder="40140455"
                          className="mt-2 h-11"
                          inputMode="numeric"
                        />
                        {errors.holderPostalCode && (
                          <p className="mt-1 text-xs text-destructive">{errors.holderPostalCode}</p>
                        )}
                      </div>

                      <div className="field-animate">
                        <Label htmlFor="holderAddressNumber">Número do endereço</Label>
                        <Input
                          id="holderAddressNumber"
                          value={form.holderAddressNumber}
                          onChange={handleFieldChange('holderAddressNumber')}
                          placeholder="100"
                          className="mt-2 h-11"
                        />
                        {errors.holderAddressNumber && (
                          <p className="mt-1 text-xs text-destructive">
                            {errors.holderAddressNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-border/60 bg-background p-4">
                  <div className="grid gap-4 md:grid-cols-[1fr_240px] md:items-end">
                    <div>
                      <p className="text-xs text-muted-foreground">Cobrança desta operação</p>
                      <p className="text-lg font-semibold">{formatCurrency(payment.value)}</p>
                    </div>
                    <div>
                      <Label htmlFor="installments">Parcelamento</Label>
                      <Select value={selectedInstallments} onValueChange={setSelectedInstallments}>
                        <SelectTrigger id="installments" className="mt-2 h-11">
                          <SelectValue placeholder="Selecione as parcelas" />
                        </SelectTrigger>
                        <SelectContent>
                          {allowedInstallments.map((installment) => (
                            <SelectItem key={installment} value={String(installment)}>
                              {installment === 1 ? '1x sem parcelamento' : `${installment}x`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    className="mt-4 h-11 w-full"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processando pagamento
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Realizar pagamento
                      </>
                    )}
                  </Button>

                  {payment.contract?.contract_file_url && (
                    <p className="mt-3 text-center text-xs text-muted-foreground">
                      Ao realizar o pagamento, concordo com o{' '}
                      <a
                        href={payment.contract.contract_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary underline underline-offset-4"
                      >
                        contrato de prestação de serviço
                      </a>
                      .
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )
      ) : (
        <Card className="border-border/60 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            {isPaid ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <QrCode className="h-5 w-5 text-primary" />
            )}
            <h2 className="text-lg font-semibold">
              {isPaid ? 'Pagamento confirmado' : 'Pagamento via Pix'}
            </h2>
          </div>

          {isPaid ? (
            <div className="grid gap-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                <div className="success-ring mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-white">
                  <div className="success-check flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>
                </div>
                <Badge className="rounded-full bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-600">
                  Pago
                </Badge>
                <h3 className="mt-4 text-xl font-semibold text-emerald-950">
                  Cobrança paga
                </h3>
                <p className="mt-2 text-sm text-emerald-800">
                  O pagamento Pix foi identificado e o pedido já está atualizado.
                </p>
                <div className="mt-5 grid gap-3 text-left sm:grid-cols-2">
                  <div className="rounded-xl border border-emerald-200 bg-white/80 p-4">
                    <p className="text-xs text-emerald-700">Valor pago</p>
                    <p className="mt-1 text-base font-semibold text-emerald-950">
                      {formatCurrency(paymentValue)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-white/80 p-4">
                    <p className="text-xs text-emerald-700">Status</p>
                    <p className="mt-1 text-base font-semibold text-emerald-950">
                      {chargeStatusMap[latestCharge?.status ?? ''] ?? latestCharge?.status ?? 'Pago'}
                    </p>
                  </div>
                </div>
                {receiptUrl && (
                  <Button asChild className="mt-5">
                    <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
                      Ver recibo
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ) : pixQrCode ? (
            <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
              <div className="rounded-xl border border-border/60 bg-white p-5">
                <div className="flex h-full min-h-72 items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`data:image/png;base64,${pixQrCode.encodedImage}`}
                    alt="QR Code Pix"
                    className="h-64 w-64 rounded-lg object-contain"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
                  <p className="text-xs text-muted-foreground">Valor</p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">
                    {formatCurrency(paymentValue)}
                  </p>
                </div>

                {pixCopyPaste && (
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground">Pix copia e cola</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleCopyPix}
                        className="shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                        {hasCopiedPix ? 'Copiado' : 'Copiar'}
                      </Button>
                    </div>
                    <p className="mt-4 break-all rounded-lg bg-background p-4 text-xs font-medium leading-relaxed text-foreground">
                      {pixCopyPaste}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 p-6 text-center">
              <Receipt className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Visualização disponível em breve</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Este pedido ainda não tem conteúdo detalhado de cobrança para exibir.
              </p>
            </div>
          )}
        </Card>
      )}

      <style jsx>{`
        .field-animate {
          animation: field-in 480ms ease-out both;
        }

        .payment-fields > :nth-child(1) { animation-delay: 40ms; }
        .payment-fields > :nth-child(2) { animation-delay: 90ms; }
        .payment-fields > :nth-child(3) { animation-delay: 140ms; }
        .payment-fields > :nth-child(4) { animation-delay: 190ms; }
        .holder-fields > :nth-child(1) { animation-delay: 40ms; }
        .holder-fields > :nth-child(2) { animation-delay: 90ms; }
        .holder-fields > :nth-child(3) { animation-delay: 140ms; }
        .holder-fields > :nth-child(4) { animation-delay: 190ms; }
        .holder-fields > :nth-child(5) { animation-delay: 240ms; }

        .success-ring {
          animation: success-pulse 1.4s ease-out infinite;
        }

        .success-check {
          animation: success-pop 620ms cubic-bezier(.2,.9,.24,1.2);
        }

        @keyframes field-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes success-pop {
          0% {
            opacity: 0;
            transform: scale(0.7);
          }
          60% {
            opacity: 1;
            transform: scale(1.08);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes success-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.25);
          }
          70% {
            box-shadow: 0 0 0 22px rgba(34, 197, 94, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
        }
      `}</style>
    </div>
  )
}
