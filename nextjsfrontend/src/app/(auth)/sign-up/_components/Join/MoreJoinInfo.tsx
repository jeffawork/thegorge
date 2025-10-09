import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

const MoreJoinInfo = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <section className="space-y-5">
      <h1 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-center text-xl font-bold text-transparent">
        Terms & Preferences
      </h1>
      <div>
        <Label className="text-primary-foreground/45" htmlFor="invitationCode">
          Invitation Code
        </Label>
        <Input {...register('invitationCode')} placeholder="Invitation Code" />
        {errors.invitationCode && (
          <p className="text-sm text-red-500">
            {errors.invitationCode.message as string}
          </p>
        )}
      </div>
      <div>
        <Label className="text-primary-foreground/45" htmlFor="department">
          Department
        </Label>
        <Input {...register('department')} placeholder="Department" />
        {errors.department && (
          <p className="text-sm text-red-500">
            {errors.department.message as string}
          </p>
        )}
      </div>
      <div>
        <Label className="text-primary-foreground/45" htmlFor="managerEmail">
          Manager Email
        </Label>
        <Input {...register('managerEmail')} placeholder="Manager Email" />
        {errors.managerEmail && (
          <p className="text-sm text-red-500">
            {errors.managerEmail.message as string}
          </p>
        )}
      </div>
      <div>
        <Label className="text-primary-foreground/45" htmlFor="jobTitle">
          Job Title
        </Label>
        <Input {...register('jobTitle')} placeholder="Job Title" />
        {errors.jobTitle && (
          <p className="text-sm text-red-500">
            {errors.jobTitle.message as string}
          </p>
        )}
      </div>
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

export default MoreJoinInfo;
