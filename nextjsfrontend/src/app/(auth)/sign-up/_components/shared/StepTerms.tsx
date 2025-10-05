'use client';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';

export const StepTerms = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const { handleSubmit, register } = useFormContext();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <label className="flex items-center gap-2">
        <input type="checkbox" {...register('termsAccepted')} required />
        Accept Terms & Conditions
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" {...register('marketingConsent')} />
        Receive marketing updates
      </label>

      <Button type="submit">Submit</Button>
    </form>
  );
};
