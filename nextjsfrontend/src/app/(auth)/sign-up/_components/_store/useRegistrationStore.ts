// src/app/(auth)/register/_store/useRegistrationStore.ts
'use client';
import { create } from 'zustand';

interface RegistrationState {
  registrationType: 'individual' | 'organization' | 'join_organization' | null;
  step: number;
  setType: (registrationType: RegistrationState['registrationType']) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

export const useRegistrationStore = create<RegistrationState>((set) => ({
  registrationType: null,
  step: 0,
  setType: (registrationType) => set({ registrationType, step: 0 }),
  nextStep: () => set((s) => ({ step: s.step + 1 })),
  prevStep: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
  reset: () => set({ step: 0, registrationType: null }),
}));
