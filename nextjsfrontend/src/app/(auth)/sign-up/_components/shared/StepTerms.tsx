'use client';
import { useFormContext } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const StepTerms = () => {
  const { register } = useFormContext();

  return (
    <section className="space-y-4">
      <h1 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-center text-xl font-bold text-transparent">
        Terms & Preferences
      </h1>

      <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/30 px-4 py-3 transition hover:bg-background/50">
        <Label
          htmlFor="termsAccepted"
          className="flex items-center gap-2 text-sm text-primary-foreground/80"
        >
          Accept Terms & Conditions
        </Label>
        <Checkbox
          id="termsAccepted"
          className="size-5 cursor-pointer accent-primary"
          {...register('acceptTerms')}
          required
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/30 px-4 py-3 transition hover:bg-background/50">
        <Label
          htmlFor="marketingConsent"
          className="flex items-center gap-2 text-sm text-primary-foreground/80"
        >
          Receive Marketing Updates
        </Label>
        <Checkbox
          id="marketingConsent"
          className="size-5 cursor-pointer accent-primary"
          {...register('marketingConsent')}
        />
      </div>
    </section>
  );
};
