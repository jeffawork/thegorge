'use client';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Wait for Zustand to rehydrate from  its localStorage
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!user) {
      router.replace('/sign-in');
    }
  }, [user, router]);

  if (!hydrated) {
    // Avoid showing dashboard before hydration
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) return null; // or show a spinner

  return <div>{children}</div>;
}
