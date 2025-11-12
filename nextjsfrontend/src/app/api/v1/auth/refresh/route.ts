import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("refresh_token")?.value;
    if (!refreshToken) {
      return NextResponse.json({ message: "No refresh token" }, { status: 401 });
    }

    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: "GET",
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
      },
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    const res = NextResponse.json(data);

    // Explicitly set the cookies from backend data
    if (data?.data?.accessToken) {
      res.cookies.set("access_token", data.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    if (data?.data?.refreshToken) {
      res.cookies.set("refresh_token", data.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    return res;
  } catch (err) {
    console.error("Refresh error:", err);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
