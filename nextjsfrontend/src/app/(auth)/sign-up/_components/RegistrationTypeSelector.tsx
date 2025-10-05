// src/app/(auth)/register/_components/RegistrationTypeSelector.tsx
'use client';
import { Button } from '@/components/ui/button';
import { useRegistrationStore } from './_store/useRegistrationStore';

export const RegistrationTypeSelector = () => {
  const setType = useRegistrationStore((s) => s.setType);

  return (
    <div className="space-y-4 text-center">
      <h1 className="text-gradient mb-2 text-center text-3xl font-bold">
        Create Your Account
      </h1>
      <p className="text-center font-medium text-primary-foreground/45">
        Select your registration type to get started
      </p>
      <div className="flex flex-col gap-3">
        <Button onClick={() => setType('individual')}>Individual</Button>
        <Button onClick={() => setType('organization')}>Organization</Button>
        <Button onClick={() => setType('join')}>Join Organization</Button>
      </div>
    </div>
  );
};
