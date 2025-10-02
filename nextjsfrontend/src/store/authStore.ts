import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user: User | null) =>
        set({
          user,
          isAuthenticated: !!user
        }),

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        
        });
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
