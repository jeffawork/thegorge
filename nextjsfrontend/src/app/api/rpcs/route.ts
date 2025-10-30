import axios, { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body: RpcCredentials = await request.json();

    // Extract cookies from incoming client request
    const cookies = request.headers.get('cookie');

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/rpcs`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(cookies ? { Cookie: cookies } : {}), // <-- Forward cookies
        },
        withCredentials: true,
      }
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error("Add RPC error:", error);

    if (error instanceof AxiosError && error.response) {
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    }

    return NextResponse.json(
      {
        status: "error",
        message: "Unexpected error occurred while adding RPC",
      },
      { status: 500 }
    );
  }
}


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
      `${process.env.NEXT_PUBLIC_API_URL}/rpcs`,
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
    console.error("error fetching RPCs:", error);

    // Handle backend errors gracefully
    if (error instanceof AxiosError && error.response) {
      const status = error.response.status;
      const data = error.response.data;

      return NextResponse.json(data, { status });
    }

    // Unknown error
    return NextResponse.json(
      { status: "error", message: "Unexpected error fetching profile" },
      { status: 500 }
    );
  }
}
    