import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // The refresh token is stored as a secure, httpOnly cookie
    const refreshToken = req.cookies.get("refresh_token")?.value;
    if (!refreshToken) {
      return NextResponse.json({ message: "No refresh token" }, { status: 401 });
    }

    // Send it to your backend for verification & new token issuance
    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: "GET",
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
      },
    });

    if (!backendRes.ok) {
      return NextResponse.json({ message: "Token refresh failed" }, { status: 401 });
    }

    // Backend should respond with new access + refresh tokens (as cookies)
    // We forward them to the client
    const setCookies = backendRes.headers.get("set-cookie");
    const data = await backendRes.json();

    const response = NextResponse.json(data);
    if (setCookies) {
      response.headers.set("set-cookie", setCookies);
    }

    return response;
  } catch (err) {
    console.error("Refresh error:", err);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
