'use client'

import Script from 'next/script'
import { useTheme } from 'next-themes'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

type TokenizeCustomer = { name: string; email: string; taxId: string }
type CheckoutInstance = {
  mount: (target: HTMLElement) => Promise<void> | void
  tokenize: (customer: TokenizeCustomer) => Promise<{ token: string }>
  destroy: () => void
}

declare global {
  interface Window {
    AbacatePay?: {
      create: (options: {
        publicKey: string
        amount: number
        theme?: {
          styles: Record<string, Record<string, string>>
        }
        onCardChange: (state: { canTokenize: boolean }) => void
      }) => CheckoutInstance
    }
  }
}

export type AbacatePayCardFieldsRef = {
  tokenize: (customer: TokenizeCustomer) => Promise<string>
}

type Props = {
  publicKey: string
  amount: number
  scriptUrl: string
  onReadyChange?: (ready: boolean) => void
}

export const AbacatePayCardFields = forwardRef<AbacatePayCardFieldsRef, Props>(
  function AbacatePayCardFields({ publicKey, amount, scriptUrl, onReadyChange }, ref) {
    const { resolvedTheme } = useTheme()
    const containerRef = useRef<HTMLDivElement>(null)
    const checkoutRef = useRef<CheckoutInstance | null>(null)
    const [scriptLoaded, setScriptLoaded] = useState(false)

    useEffect(() => {
      if (!scriptLoaded || !window.AbacatePay || !containerRef.current || !publicKey || amount <= 0) return

      const isDark = resolvedTheme === 'dark'
      const foreground = isDark ? '#fafafa' : '#171717'
      const mutedForeground = isDark ? '#a1a1aa' : '#71717a'
      const inputBackground = isDark ? '#18181b' : '#ffffff'
      const borderColor = isDark ? '#52525b' : '#d4d4d8'
      const prioritizedForeground = `${foreground} !important`
      const prioritizedMutedForeground = `${mutedForeground} !important`

      const checkout = window.AbacatePay.create({
        publicKey,
        amount,
        theme: {
          styles: {
            ':root': {
              colorScheme: isDark ? 'dark' : 'light',
            },
            fieldset: {
              color: foreground,
              backgroundColor: 'transparent',
            },
            'fieldset[ev-component="Card"] label': {
              color: prioritizedForeground,
            },
            'fieldset[ev-component="Card"] .field input': {
              color: prioritizedForeground,
              backgroundColor: `${inputBackground} !important`,
              borderColor,
              WebkitTextFillColor: prioritizedForeground,
              caretColor: prioritizedForeground,
            },
            'fieldset[ev-component="Card"] .field input::placeholder': {
              color: prioritizedMutedForeground,
              WebkitTextFillColor: prioritizedMutedForeground,
              opacity: '1',
            },
            'fieldset[ev-component="Card"] .field input:-webkit-autofill': {
              color: prioritizedForeground,
              WebkitTextFillColor: prioritizedForeground,
              WebkitBoxShadow: `0 0 0 1000px ${inputBackground} inset`,
              caretColor: prioritizedForeground,
            },
            'fieldset[ev-component="Card"] .field:focus-within input': {
              color: prioritizedForeground,
              borderColor: isDark ? '#a1a1aa' : '#52525b',
              WebkitTextFillColor: prioritizedForeground,
            },
          },
        },
        onCardChange: ({ canTokenize }) => onReadyChange?.(canTokenize),
      })
      checkoutRef.current = checkout
      void checkout.mount(containerRef.current)

      return () => {
        onReadyChange?.(false)
        checkout.destroy()
        checkoutRef.current = null
      }
    }, [amount, onReadyChange, publicKey, resolvedTheme, scriptLoaded])

    useImperativeHandle(ref, () => ({
      async tokenize(customer) {
        if (!checkoutRef.current) throw new Error('O formulário seguro do cartão ainda está carregando.')
        const result = await checkoutRef.current.tokenize(customer)
        if (!result.token) throw new Error('Não foi possível tokenizar o cartão.')
        return result.token
      },
    }), [])

    return (
      <>
        <Script src={scriptUrl} strategy="afterInteractive" onReady={() => setScriptLoaded(true)} />
        <div ref={containerRef} className="min-h-36 rounded-xl border border-border/60 bg-background p-3" />
        <p className="mt-2 text-xs text-muted-foreground">
          Os dados do cartão são preenchidos e tokenizados diretamente pela AbacatePay.
        </p>
      </>
    )
  }
)
