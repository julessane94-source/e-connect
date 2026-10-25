import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    const hasActiveSession = Boolean(token?.id)
    const isStaff = Boolean(token?.role)

    // A JWT whose account was disabled is treated as signed out.
    if (!hasActiveSession && path !== "/" && !path.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    // Redirect active users away from the sign-in page.
    if (hasActiveSession && path === "/auth/login") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    if (path.startsWith("/suivi-agents") && !["ADMIN", "MANAGER"].includes(String(token?.role))) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    const staffOnlyPaths = [
      "/etat-civil",
      "/documents",
      "/messagerie",
      "/courrier",
      "/taches",
      "/reporting",
      "/parametres",
      "/calendrier",
    ]

    if (token && !isStaff && staffOnlyPaths.some((route) => path.startsWith(route))) {
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
    "/profil/:path*",
    "/notifications/:path*",
    "/messagerie/:path*",
    "/courrier/:path*",
    "/taches/:path*",
    "/reporting/:path*",
    "/parametres/:path*",
    "/calendrier/:path*",
    "/suivi-agents/:path*",
    "/auth/login",
  ],
}

