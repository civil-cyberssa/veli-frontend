import { act, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import LoginScreen from "../login"

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  getSession: vi.fn(),
  replace: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}))

vi.mock("next-auth/react", () => ({
  signIn: mocks.signIn,
  getSession: mocks.getSession,
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}))

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}))

vi.mock("sonner", () => ({
  toast: {
    error: mocks.toastError,
    success: mocks.toastSuccess,
  },
}))

vi.mock("@/components/shared/theme-toggle-mode", () => ({
  ModeToggle: () => null,
}))

vi.mock("next/script", async () => {
  const React = await vi.importActual<typeof import("react")>("react")

  return {
    default: function MockScript({ onReady }: { onReady?: () => void }) {
      React.useEffect(() => {
        onReady?.()
      }, [onReady])

      return null
    },
  }
})

describe("LoginScreen com Google", () => {
  let credentialCallback: ((response: { credential?: string }) => void) | null

  beforeEach(() => {
    credentialCallback = null
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "google-client-id")
    vi.stubGlobal(
      "ResizeObserver",
      class ResizeObserverMock {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
    localStorage.clear()
    localStorage.setItem("hasLoggedBefore", "true")
    mocks.getSession.mockResolvedValue({ completed_profile: true })

    Object.defineProperty(window, "google", {
      configurable: true,
      value: {
        accounts: {
          id: {
            initialize: vi.fn(
              (config: {
                callback: (response: { credential?: string }) => void
              }) => {
                credentialCallback = config.callback
              },
            ),
            renderButton: vi.fn(),
          },
        },
      },
    })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
    localStorage.clear()
  })

  it("cria a sessão e redireciona após receber o ID token", async () => {
    localStorage.setItem("courseSelectionCompleted", "true")
    localStorage.setItem("lastSelectedCourseId", "10")
    mocks.signIn.mockResolvedValue({ ok: true, error: null })

    render(<LoginScreen />)

    await waitFor(() => expect(credentialCallback).not.toBeNull())

    act(() => {
      credentialCallback?.({ credential: "google-id-token" })
    })

    await waitFor(() => {
      expect(mocks.signIn).toHaveBeenCalledWith("google-credentials", {
        credential: "google-id-token",
        redirect: false,
      })
      expect(mocks.replace).toHaveBeenCalledWith("/home")
    })

    expect(localStorage.getItem("courseSelectionCompleted")).toBeNull()
    expect(localStorage.getItem("lastSelectedCourseId")).toBeNull()
  })

  it("mostra o erro do backend e libera uma nova tentativa", async () => {
    mocks.signIn.mockResolvedValue({
      ok: false,
      error: "Não existe uma conta cadastrada para este e-mail.",
    })

    render(<LoginScreen />)

    await waitFor(() => expect(credentialCallback).not.toBeNull())

    act(() => {
      credentialCallback?.({ credential: "unknown-google-id-token" })
    })

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith(
        "Falha na autenticação",
        expect.objectContaining({
          description: "Não existe uma conta cadastrada para este e-mail.",
        }),
      )
      expect(screen.getByLabelText("E-mail")).toBeEnabled()
    })
  })

  it("leva para completar o perfil quando o backend sinaliza perfil incompleto", async () => {
    mocks.signIn.mockResolvedValue({ ok: true, error: null })
    mocks.getSession.mockResolvedValue({ completed_profile: false })

    render(<LoginScreen />)

    await waitFor(() => expect(credentialCallback).not.toBeNull())

    act(() => {
      credentialCallback?.({ credential: "google-id-token" })
    })

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/complete-profile")
    })
  })
})
