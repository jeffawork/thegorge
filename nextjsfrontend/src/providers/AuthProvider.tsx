'use client';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const checkOrRefreshSession = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { withCredentials: true }
        );

        if (res.data?.data?.accessToken) {
          console.log('Refresh successful:', res.data.data.accessToken);
          // keep existing user if exists
          if (!user) {
            console.warn('No user in store, consider refetching user info');
          }
        } else {
          throw new Error('No session found');
        }
      } catch (error) {
        console.error('Session refresh failed:', error);
        setUser(null);
        router.replace('/sign-in');
      } finally {
        setCheckingAuth(false);
      }
    };

    checkOrRefreshSession();
  }, [hydrated]);

  if (!hydrated || checkingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
