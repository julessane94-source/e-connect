// middleware/auth.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function authMiddleware(request: NextRequest) {
  const token = request.cookies.get("next-auth.session-token") || 
                request.cookies.get("__Secure-next-auth.session-token");

  const path = request.nextUrl.pathname;

  // Pages publiques
  if (path === "/auth/login" || path === "/auth/logout" || path === "/") {
    return NextResponse.next();
  }

  // Rediriger vers login si non authentifié
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}
