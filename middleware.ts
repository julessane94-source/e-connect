import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Rediriger vers login si non authentifié
    if (!token && path !== "/auth/login" && path !== "/" && !path.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    // Rediriger vers dashboard si déjà connecté sur login
    if (token && path === "/auth/login") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/etat-civil/:path*",
    "/documents/:path*",
    "/demandes/:path*",
    "/messagerie/:path*",
    "/courrier/:path*",
    "/taches/:path*",
    "/reporting/:path*",
    "/parametres/:path*",
    "/calendrier/:path*",
    "/auth/login",
  ],
}
