// src/app/(auth)/register/_components/RegistrationTypeSelector.tsx
'use client';
import { Button } from '@/components/ui/button';
import { useRegistrationStore } from '../_store/useRegistrationStore';
import Link from 'next/link';

export const RegistrationTypeSelector = () => {
  const setType = useRegistrationStore((s) => s.setType);

  return (
    <div className="space-y-4 text-center">
      <h1 className="text-gradient mb-2 text-center text-3xl font-bold">
        Create Your Account
      </h1>
      <p className="text-center font-medium text-primary-foreground/45">
        Register as an Individual, Organization, or Join an existing
        Organization
      </p>
      <div className="flex flex-col gap-3">
        <Button variant="link" onClick={() => setType('individual')}>
          Individual
        </Button>
        <Button variant="link" onClick={() => setType('organization')}>
          Organization
        </Button>
        <Button variant="link" onClick={() => setType('join')}>
          Join Organization
        </Button>
      </div>
      <footer className="mt-3 flex justify-between gap-1">
        <p className="text-sm font-normal text-primary-foreground/45">
          Already have an account ?
        </p>
        <Link
          className="hover:text-gradient cursor-pointer text-sm font-medium text-primary-foreground"
          href="/sign-in"
        >
          Sign in
        </Link>
      </footer>
    </div>
  );
};
