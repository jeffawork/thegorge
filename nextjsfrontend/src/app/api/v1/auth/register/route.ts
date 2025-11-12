import axios, { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body: registerCredentials = await request.json();

    // we validate the fields
    const requiredFields: (keyof registerCredentials)[] = [
      'registrationType',
      'email',
      'password',
      'confirm_password',
    ];

   for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            status: 'failure',
            status_code: 400,
            message: `${String(field)} is required`,
          },
          { status: 400 }
        );
      }
    }

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
      body ,
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      }
    );
console.log(request.url)
    console.log(process.env.NEXT_PUBLIC_API_URL)
    const responseData = response.data;

    // Create clean response without tokens
    const cleanedData = { ...responseData };
    if (cleanedData.data) {
      const { token, refreshToken, ...userDataWithoutTokens } =
        cleanedData.data;
      cleanedData.data = userDataWithoutTokens;

      const nextResponse = NextResponse.json(cleanedData, { status: 200 });

      // Set cookies with consistent settings
      if (token) {
        nextResponse.cookies.set('access_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax', // Consistent setting
          maxAge: 15 * 60, // 15 minutes
          path: '/',
        });
      }

      if (refreshToken) {
        nextResponse.cookies.set('refresh_token', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax', // Consistent setting
          maxAge: 7 * 24 * 60 * 60, // 7 days
          path: '/',
        });
      }

      return nextResponse;
    }
  } catch (error) {
    console.error('registration error:', error);

    if (error instanceof AxiosError && error.response) {
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    }

    return NextResponse.json(
      {
        status: 'error',
        status_code: 500,
        message: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
