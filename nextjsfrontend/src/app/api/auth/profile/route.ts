import axios, { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies the profile request from frontend → backend.
 * Reads cookies from the incoming request and forwards them to backend.
 */
export async function GET(req: NextRequest) {
  try {
    // Extract cookies from the incoming request
    const accessToken = req.cookies.get("access_token")?.value;
    const refreshToken = req.cookies.get("refresh_token")?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        { status: "failure", message: "Unauthorized: No tokens found" },
        { status: 401 }
      );
    }

    // Make request to backend
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
      {
        headers: {
          // Only send Bearer token if you want to support the fallback header
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        withCredentials: true, // Important for sending cookies across
      }
    );

    // Success — forward backend data to frontend
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error("Profile fetch error:", error);

    // Handle backend errors gracefully
    if (error instanceof AxiosError && error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Token expired or unauthorized? Return consistent JSON
      if (status === 401 || status === 403) {
        return NextResponse.json(
          { status: "failure", message: "Session expired or unauthorized" },
          { status: 401 }
        );
      }

      return NextResponse.json(data, { status });
    }

    // Unknown error
    return NextResponse.json(
      { status: "error", message: "Unexpected error fetching profile" },
      { status: 500 }
    );
  }
}
