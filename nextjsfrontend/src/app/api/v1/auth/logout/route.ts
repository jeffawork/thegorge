import { cookies } from 'next/headers';

export async function POST() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Backend logout failed');

    // Clear local gateway cookies
    const cookieStore = await cookies();
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');

    return Response.json({ message: 'Logged out successfully' });
  } catch (err: any) {
    console.error(err);
    return Response.json({ message: 'Logout failed' }, { status: 500 });
  }
}
