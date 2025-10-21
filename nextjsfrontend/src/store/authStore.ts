import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,

      setUser: (user: User | null) =>
        set({
          user,
          isAuthenticated: !!user
        }),

      setToken: (token: string) =>
        set({
          accessToken: token
        }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
