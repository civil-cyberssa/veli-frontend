import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { authenticateWithGoogle } from "../google-auth"

const successfulResponse = {
  refresh: "jwt-refresh-token",
  access: "jwt-access-token",
  token: "jwt-access-token",
  role: "student",
  student_full_name: "Maria Silva",
  languages: [{ id: 1, name: "Inglês" }],
  completed_profile: false,
  account_created: false,
  linked_existing_user: true,
}

describe("authenticateWithGoogle", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com")
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("envia a credential para o endpoint do Google", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(successfulResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )
    vi.stubGlobal("fetch", fetchMock)

    const result = await authenticateWithGoogle("google-id-token")

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/student-portal/auth/google/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: "google-id-token" }),
      },
    )
    expect(result).toEqual(successfulResponse)
  })

  it("propaga a primeira mensagem non_field_errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            non_field_errors: [
              "Não existe uma conta cadastrada para este e-mail.",
            ],
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        ),
      ),
    )

    await expect(authenticateWithGoogle("google-id-token")).rejects.toThrow(
      "Não existe uma conta cadastrada para este e-mail.",
    )
  })

  it("usa mensagem genérica para falha de rede", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")))

    await expect(authenticateWithGoogle("google-id-token")).rejects.toThrow(
      "Não foi possível entrar com o Google. Tente novamente.",
    )
  })

  it("rejeita uma resposta de sucesso inválida", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ access: "incompleto" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    )

    await expect(authenticateWithGoogle("google-id-token")).rejects.toThrow(
      "Não foi possível entrar com o Google. Tente novamente.",
    )
  })
})
