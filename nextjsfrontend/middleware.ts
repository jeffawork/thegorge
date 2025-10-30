import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow access to public pages and Next.js internals
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("token")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  // If access token exists, allow
  if (accessToken) return NextResponse.next();

  // Try silent refresh if refresh token exists
  if (refreshToken) {
    try {
      const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { Cookie: `refresh_token=${refreshToken}` },
      });

      if (refreshRes.ok) {
        const res = NextResponse.next();
        const setCookie = refreshRes.headers.get("set-cookie");
        if (setCookie) res.headers.set("set-cookie", setCookie);
        return res;
      }
    } catch (err) {
      console.error("Middleware refresh failed:", err);
    }
  }

  //  if it's an API call or a page request
  const isApiRoute = pathname.startsWith("/api");

  if (isApiRoute) {
    // Return JSON response for APIs
    return NextResponse.json(
      { status: "failure", message: "Unauthorized" },
      { status: 401 }
    );
  } else {
    // Redirect to login for pages
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/rpcs/:path*",
    "/alerts/:path*",
    "/settings/:path*",
    "/api/protected/:path*", // example protected API
  ],
};
