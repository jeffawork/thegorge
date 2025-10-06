'use client';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const StepTerms = () => {
  const { register } = useFormContext();

  return (
    <section className="space-y-2">
      <h1 className="text-gradient mb-2 text-center font-bold">
        Terms & Preferences
      </h1>
      <div>
        <Label className="flex items-center gap-2 text-primary-foreground/45">
          Accept Terms & Conditions
        </Label>
        <Input type="checkbox" {...register('termsAccepted')} required />
      </div>
      <div>
        <Label className="flex items-center gap-2 text-primary-foreground/45">
          Receive marketing updates
        </Label>
        <Input type="checkbox" {...register('marketingConsent')} />
      </div>
    </section>
  );
};
