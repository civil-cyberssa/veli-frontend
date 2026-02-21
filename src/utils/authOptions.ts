import CredentialsProvider from "next-auth/providers/credentials"

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL

        if (!baseUrl) {
          throw new Error("NEXT_PUBLIC_API_URL não configurada")
        }

        const response = await fetch(`${baseUrl}/student-portal/auth/login/`, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        })

        const user = await response.json()

        if (user && response.ok) {
          return user
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: "/auth",
  },
  callbacks: {
    // @ts-expect-error - Ignorar erros de tipagem nos callbacks
    async jwt({ token, user }) {
      if (user) {
        token.user = user
      }
      return token
    },
    // @ts-expect-error - Ignorar erros de tipagem nos callbacks
    async session({ session, token }) {
      session = token.user as unknown
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "seu-segredo-temporario",
} as never

export default authOptions
