import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
    const isPublicPage = req.nextUrl.pathname === "/" || isAuthPage

    // Se está autenticado e tenta acessar página de auth, redireciona para home
    if (isAuth && isAuthPage) {
      return NextResponse.redirect(new URL("/home", req.url))
    }

    // Se não está autenticado e tenta acessar página privada, redireciona para auth
    if (!isAuth && !isPublicPage) {
      let from = req.nextUrl.pathname
      if (req.nextUrl.search) {
        from += req.nextUrl.search
      }

      return NextResponse.redirect(
        new URL(`/auth?from=${encodeURIComponent(from)}`, req.url)
      )
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => {
        // Retorna true para permitir que o middleware acima lide com a lógica
        return true
      },
    },
  }
)

// Configuração de rotas que o middleware deve processar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.gif$).*)",
  ],
}
