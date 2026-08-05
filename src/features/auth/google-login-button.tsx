"use client"

import Script from "next/script"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"

interface GoogleCredentialResponse {
  credential?: string
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
    ux_mode: "popup"
  }) => void
  renderButton: (
    parent: HTMLElement,
    options: {
      type: "standard"
      size: "large"
      theme: "outline" | "filled_black"
      text: "signin_with"
      shape: "rectangular"
      logo_alignment: "left"
      locale: "pt-BR"
      width: number
    },
  ) => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId
      }
    }
  }
}

interface GoogleLoginButtonProps {
  disabled: boolean
  onCredential: (credential: string) => void
}

export function GoogleLoginButton({
  disabled,
  onCredential,
}: GoogleLoginButtonProps) {
  const buttonContainerRef = useRef<HTMLDivElement>(null)
  const [scriptReady, setScriptReady] = useState(false)
  const [scriptFailed, setScriptFailed] = useState(false)
  const { resolvedTheme } = useTheme()
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  const renderButton = useCallback(() => {
    const container = buttonContainerRef.current
    const googleAccounts = window.google?.accounts.id

    if (!container || !googleAccounts || !clientId) return

    container.replaceChildren()

    googleAccounts.initialize({
      client_id: clientId,
      ux_mode: "popup",
      callback: ({ credential }) => {
        if (credential) onCredential(credential)
      },
    })

    const containerWidth = Math.floor(container.getBoundingClientRect().width)

    googleAccounts.renderButton(container, {
      type: "standard",
      size: "large",
      theme: resolvedTheme === "dark" ? "filled_black" : "outline",
      text: "signin_with",
      shape: "rectangular",
      logo_alignment: "left",
      locale: "pt-BR",
      width: Math.min(Math.max(containerWidth || 320, 200), 400),
    })
  }, [clientId, onCredential, resolvedTheme])

  useEffect(() => {
    if (!scriptReady) return

    renderButton()

    const container = buttonContainerRef.current
    if (!container || typeof ResizeObserver === "undefined") return

    const observer = new ResizeObserver(renderButton)
    observer.observe(container)

    return () => observer.disconnect()
  }, [renderButton, scriptReady])

  const unavailable = scriptFailed || !clientId

  return (
    <>
      <Script
        id="google-identity-services"
        src="https://accounts.google.com/gsi/client?hl=pt-BR"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() => setScriptFailed(true)}
      />

      <div
        className={disabled ? "pointer-events-none opacity-60" : undefined}
        aria-busy={disabled}
      >
        <div ref={buttonContainerRef} className="flex min-h-11 w-full justify-center" />
      </div>

      {unavailable && (
        <p className="text-center text-xs text-muted-foreground">
          Login com Google indisponível. Use seu e-mail e senha.
        </p>
      )}
    </>
  )
}

