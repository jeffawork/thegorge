'use client';
import { Controller, useFormContext } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export const StepTerms = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <section className="space-y-5">
      <h1 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-center text-xl font-bold text-transparent">
        Terms & Preferences
      </h1>

      {/* Accept Terms */}
      <div className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3 transition hover:bg-muted/10">
        <Label
          htmlFor="acceptTerms"
          className="flex items-center gap-2 text-sm text-primary-foreground/80"
        >
          Accept Terms & Conditions
        </Label>

        <Controller
          name="acceptTerms"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="acceptTerms"
              checked={!!field.value}
              onCheckedChange={field.onChange}
              className="size-5 cursor-pointer accent-primary"
            />
          )}
        />
      </div>
      {errors.acceptTerms && (
        <p className="mt-1 text-sm text-red-500">
          {errors.acceptTerms.message as string}
        </p>
      )}

      {/* Marketing Consent */}
      <div className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3 transition hover:bg-muted/10">
        <Label
          htmlFor="marketingConsent"
          className="flex items-center gap-2 text-sm text-primary-foreground/80"
        >
          Receive Marketing Updates
        </Label>

        <Controller
          name="marketingConsent"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="marketingConsent"
              checked={!!field.value}
              onCheckedChange={field.onChange}
              className="size-5 cursor-pointer accent-primary"
            />
          )}
        />
      </div>
      {errors.marketingConsent && (
        <p className="mt-1 text-sm text-red-500">
          {errors.marketingConsent.message as string}
        </p>
      )}
    </section>
  );
};
