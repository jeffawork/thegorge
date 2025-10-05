// src/app/(auth)/register/_store/useRegistrationStore.ts
'use client';
import { create } from 'zustand';

interface RegistrationState {
  type: 'individual' | 'organization' | 'join' | null;
  step: number;
  setType: (type: RegistrationState['type']) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

export const useRegistrationStore = create<RegistrationState>((set) => ({
  type: null,
  step: 0,
  setType: (type) => set({ type, step: 0 }),
  nextStep: () => set((s) => ({ step: s.step + 1 })),
  prevStep: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
  reset: () => set({ step: 0, type: null }),
}));
