const GOOGLE_AUTH_FALLBACK_ERROR =
  "Não foi possível entrar com o Google. Tente novamente."

export interface GoogleAuthResponse {
  refresh: string
  access: string
  token: string
  role: string
  student_full_name: string
  profile_pic_url?: string | null
  languages: Array<{
    id: number
    name: string
    lang_icon?: string
    lang_description?: string
  }>
  completed_profile: boolean
  account_created: boolean
  linked_existing_user: boolean
}

function isGoogleAuthResponse(value: unknown): value is GoogleAuthResponse {
  if (!value || typeof value !== "object") return false

  const response = value as Partial<GoogleAuthResponse>

  return (
    typeof response.refresh === "string" &&
    typeof response.access === "string" &&
    typeof response.token === "string" &&
    typeof response.role === "string" &&
    typeof response.student_full_name === "string" &&
    (typeof response.profile_pic_url === "undefined" ||
      typeof response.profile_pic_url === "string" ||
      response.profile_pic_url === null) &&
    Array.isArray(response.languages) &&
    typeof response.completed_profile === "boolean" &&
    typeof response.account_created === "boolean" &&
    typeof response.linked_existing_user === "boolean"
  )
}

function getApiErrorMessage(value: unknown) {
  if (!value || typeof value !== "object") return null

  const errors = (value as { non_field_errors?: unknown }).non_field_errors

  if (!Array.isArray(errors)) return null

  return errors.find(
    (error): error is string => typeof error === "string" && error.length > 0,
  ) ?? null
}

export async function authenticateWithGoogle(
  credential: string,
  fetcher: typeof fetch = fetch,
): Promise<GoogleAuthResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL não configurada")
  }

  if (!credential) {
    throw new Error(GOOGLE_AUTH_FALLBACK_ERROR)
  }

  let response: Response

  try {
    response = await fetcher(`${baseUrl}/student-portal/auth/google/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ credential }),
    })
  } catch {
    throw new Error(GOOGLE_AUTH_FALLBACK_ERROR)
  }

  let data: unknown

  try {
    data = await response.json()
  } catch {
    throw new Error(GOOGLE_AUTH_FALLBACK_ERROR)
  }

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data) ?? GOOGLE_AUTH_FALLBACK_ERROR)
  }

  if (!isGoogleAuthResponse(data)) {
    throw new Error(GOOGLE_AUTH_FALLBACK_ERROR)
  }

  return data
}
