'use client'

import { useCallback } from 'react'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import type {
  AdvancePaymentPayload,
  AdvancePaymentResponse,
  AvailableOffer,
  CreateOrderPayload,
  CreateOrderResponse,
  CouponPreview,
  CurrentContractedOfferResponse,
  PendingPayment,
  PaymentStatusResponse,
  SimpleLanguage,
  StartPaymentPayload,
  StartPaymentResponse,
} from '@/src/features/finance/types'

const fetcher = async <T,>(url: string, token: string): Promise<T> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Erro ao buscar dados financeiros: ${response.status}`)
  }

  return response.json()
}

export function useCurrentContractedOffer() {
  const { data: session, status } = useSession()

  const { data, error, isLoading, mutate } = useSWR<CurrentContractedOfferResponse[]>(
    status === 'authenticated' && session?.access
      ? [`${process.env.NEXT_PUBLIC_API_URL}/student-portal/current-contracted-offer/`, session.access]
      : null,
    ([url, token]: [string, string]) => fetcher<CurrentContractedOfferResponse[]>(url, token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
    }
  )

  return {
    data,
    error: error ?? null,
    isLoading,
    mutate,
  }
}

export function useAvailableOffers(languageId?: number | null) {
  const { data: session, status } = useSession()
  const offersUrl =
    languageId && languageId > 0
      ? `${process.env.NEXT_PUBLIC_API_URL}/student-portal/offers/?language=${languageId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/student-portal/offers/`

  const { data, error, isLoading, mutate } = useSWR<AvailableOffer[]>(
    status === 'authenticated' && session?.access
      ? [offersUrl, session.access]
      : null,
    ([url, token]: [string, string]) => fetcher<AvailableOffer[]>(url, token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
      keepPreviousData: true,
    }
  )

  return {
    data: data ?? [],
    error: error ?? null,
    isLoading,
    mutate,
  }
}

export function useSimpleLanguages() {
  const { data: session, status } = useSession()

  const { data, error, isLoading, mutate } = useSWR<SimpleLanguage[]>(
    status === 'authenticated' && session?.access
      ? [`${process.env.NEXT_PUBLIC_API_URL}/student-portal/languages/simple/`, session.access]
      : null,
    ([url, token]: [string, string]) => fetcher<SimpleLanguage[]>(url, token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
    }
  )

  return {
    data: data ?? [],
    error: error ?? null,
    isLoading,
    mutate,
  }
}

export function usePendingPayments(orderId?: number | null) {
  const { data: session, status } = useSession()
  const pendingPaymentsUrl =
    orderId && orderId > 0
      ? `${process.env.NEXT_PUBLIC_API_URL}/student-portal/pending-payments/?order_id=${orderId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/student-portal/pending-payments/`

  const { data, error, isLoading, mutate } = useSWR<PendingPayment[]>(
    status === 'authenticated' && session?.access
      ? [pendingPaymentsUrl, session.access]
      : null,
    ([url, token]: [string, string]) => fetcher<PendingPayment[]>(url, token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
    }
  )

  return {
    data: data ?? [],
    error: error ?? null,
    isLoading,
    mutate,
  }
}

export function usePendingPayment(orderId: number | null) {
  const { data: session, status } = useSession()

  const { data, error, isLoading, mutate } = useSWR<PendingPayment>(
    status === 'authenticated' && session?.access && orderId
      ? [
          `${process.env.NEXT_PUBLIC_API_URL}/student-portal/pending-payments/${orderId}/`,
          session.access,
        ]
      : null,
    ([url, token]: [string, string]) => fetcher<PendingPayment>(url, token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
    }
  )

  return {
    data,
    error: error ?? null,
    isLoading,
    mutate,
  }
}

export function useOrderPaymentStatus(
  orderId: number | null,
  cycleNumber?: number | null
) {
  const { data: session, status } = useSession()
  const paymentStatusUrl =
    orderId && cycleNumber
      ? `${process.env.NEXT_PUBLIC_API_URL}/student-portal/orders/${orderId}/cycles/${cycleNumber}/payment-status`
      : orderId
        ? `${process.env.NEXT_PUBLIC_API_URL}/student-portal/orders/${orderId}/payment-status`
        : null

  const { data, error, isLoading, mutate } = useSWR<PaymentStatusResponse>(
    status === 'authenticated' && session?.access && paymentStatusUrl
      ? [paymentStatusUrl, session.access]
      : null,
    ([url, token]: [string, string]) => fetcher<PaymentStatusResponse>(url, token),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: (latestData) => {
        const chargeIsPaid =
          latestData?.is_paid ||
          latestData?.payment_status === 'paid' ||
          latestData?.latest_charge?.status === 'paid'

        if (cycleNumber) return chargeIsPaid ? 0 : 5000

        return chargeIsPaid ||
          latestData?.checkout_status === 'active' ||
          latestData?.checkout_status === 'paid'
          ? 0
          : 5000
      },
      dedupingInterval: 1000,
    }
  )

  return {
    data,
    error: error ?? null,
    isLoading,
    mutate,
  }
}

export function useStartPayment() {
  const { data: session } = useSession()

  const startPayment = async (orderId: number, payload: StartPaymentPayload) => {
    if (!session?.access) {
      throw new Error('Sessão inválida para iniciar o pagamento.')
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/student-portal/orders/${orderId}/start-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access}`,
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      }
    )

    if (!response.ok) {
      let message = `Erro ao iniciar pagamento: ${response.status}`

      try {
        const errorData = await response.json()
        if (typeof errorData?.detail === 'string') {
          message = errorData.detail
        } else if (typeof errorData?.message === 'string') {
          message = errorData.message
        }
      } catch {
        // Mantém a mensagem padrão quando o backend não retornar JSON legível.
      }

      throw new Error(message)
    }

    return response.json() as Promise<StartPaymentResponse>
  }

  return { startPayment }
}

export function useAdvancePayment() {
  const { data: session } = useSession()

  const advancePayment = useCallback(async (
    orderId: number,
    payload: AdvancePaymentPayload
  ) => {
    if (!session?.access) {
      throw new Error('Sessão inválida para antecipar o pagamento.')
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/student-portal/orders/${orderId}/cycles/advance-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access}`,
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      }
    )

    if (!response.ok) {
      let message = `Erro ao antecipar pagamento: ${response.status}`

      try {
        const errorData = await response.json()
        if (typeof errorData?.detail === 'string') {
          message = errorData.detail
        } else if (typeof errorData?.message === 'string') {
          message = errorData.message
        }
      } catch {
        // Mantém a mensagem padrão quando o backend não retornar JSON legível.
      }

      throw new Error(message)
    }

    return response.json() as Promise<AdvancePaymentResponse>
  }, [session?.access])

  return {
    advancePayment,
    isReady: Boolean(session?.access),
  }
}

export function useCreateOrder() {
  const { data: session } = useSession()

  const createOrder = async (payload: CreateOrderPayload) => {
    if (!session?.access) {
      throw new Error('Sessão inválida para criar o pedido.')
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-portal/orders/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access}`,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      let message = `Erro ao criar pedido: ${response.status}`

      try {
        const errorData = await response.json()
        if (typeof errorData?.detail === 'string') {
          message = errorData.detail
        } else if (typeof errorData?.message === 'string') {
          message = errorData.message
        }
      } catch {
        // Mantém mensagem padrão quando o backend não retornar JSON legível.
      }

      throw new Error(message)
    }

    return response.json() as Promise<CreateOrderResponse>
  }

  return { createOrder }
}

export function useValidateCoupon() {
  const { data: session } = useSession()

  const validateCoupon = async (
    offerId: number,
    payload: { coupon_code: string; billing_option_code: string }
  ) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/hotsite/offers/${offerId}/validate-coupon/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access ? { Authorization: `Bearer ${session.access}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const couponError = Array.isArray(errorData?.coupon_code) ? errorData.coupon_code[0] : null
      throw new Error(couponError || errorData?.detail || 'Cupom inválido para esta oferta.')
    }

    return response.json() as Promise<CouponPreview>
  }

  return { validateCoupon }
}
