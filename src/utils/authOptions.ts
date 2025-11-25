import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { Session } from "next-auth"
import { JWT } from "next-auth/jwt"

interface UserData {
  refresh: string
  access: string
  first_name: string
  last_name: string
  email: string
  id: number
  last_login: string
  profile_pic: string
}

interface ExtendedToken extends JWT {
  user?: UserData
  accessTokenExpires?: number
}

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("EMAIL_PASSWORD_REQUIRED")
        }

        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.jogajuntoinstituto.org"
          const response = await fetch(`${apiUrl}/student_portal/users/login/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            // Tratamento específico de erros da API
            if (response.status === 401) {
              throw new Error("INVALID_CREDENTIALS")
            }
            if (response.status === 404) {
              throw new Error("USER_NOT_FOUND")
            }
            if (response.status >= 500) {
              throw new Error("SERVER_ERROR")
            }
            throw new Error("AUTHENTICATION_FAILED")
          }

          if (data && data.access && data.refresh) {
            return {
              ...data,
              accessTokenExpires: Date.now() + 60 * 60 * 1000, // 1 hora
            }
          }

          throw new Error("INVALID_RESPONSE")
        } catch (error) {
          console.error("Erro na autenticação:", error)
          throw error
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  callbacks: {
    async jwt({ token, user, account }): Promise<ExtendedToken> {
      // Login inicial - armazena dados do usuário
      if (account && user) {
        return {
          ...token,
          user: user as UserData,
          accessTokenExpires: (user as any).accessTokenExpires,
        }
      }

      // Retorna token anterior se ainda não expirou
      const extendedToken = token as ExtendedToken
      if (extendedToken.accessTokenExpires && Date.now() < extendedToken.accessTokenExpires) {
        return extendedToken
      }

      // Token expirou - aqui poderia implementar refresh token
      // Por enquanto, retorna o token atual
      return extendedToken
    },

    async session({ session, token }): Promise<Session> {
      const extendedToken = token as ExtendedToken
      if (extendedToken.user) {
        return {
          ...session,
          ...extendedToken.user,
        }
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default authOptions
