import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value 

  const isAuthPage = req.nextUrl.pathname.startsWith("/sign-in")
  const isProtectedPage = req.nextUrl.pathname.startsWith("/dashboard")

  // If not logged in and trying to access dashboard → redirect
  if (!token && isProtectedPage) {
    return NextResponse.redirect(new URL("/sign-in", req.url))
  }

  // If logged in and trying to access login → redirect to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

// Protect only these routes
export const config = {
  matcher: ["/dashboard/:path*", "/sign-in"],
}
