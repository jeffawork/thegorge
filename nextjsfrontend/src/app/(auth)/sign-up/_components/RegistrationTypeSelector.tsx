// src/app/(auth)/register/_components/RegistrationTypeSelector.tsx
'use client';
import { Button } from '@/components/ui/button';
import { useRegistrationStore } from './_store/useRegistrationStore';

export const RegistrationTypeSelector = () => {
  const setType = useRegistrationStore((s) => s.setType);

  return (
    <div className="space-y-4 text-center">
      <h2 className="mb-4 text-xl font-semibold">Choose Registration Type</h2>
      <div className="flex flex-col gap-3">
        <Button onClick={() => setType('individual')}>Individual</Button>
        <Button onClick={() => setType('organization')}>Organization</Button>
        <Button onClick={() => setType('join')}>Join Organization</Button>
      </div>
    </div>
  );
};
