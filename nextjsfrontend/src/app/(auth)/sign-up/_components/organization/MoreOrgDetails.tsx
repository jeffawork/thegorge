import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';
import { useFormContext } from 'react-hook-form';

function MoreOrgDetails() {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <section className="space-y-2">
      <h1 className="text-gradient mb-2 text-center font-bold">
        More Organization Details
      </h1>
      <div>
        <Label
          className="text-primary-foreground/45"
          htmlFor="organizationWebsite"
        >
          Website of Organization
        </Label>
        <Input {...register('organizationWebsite')} placeholder="Website" />
        {errors.organizationWebsite && (
          <p className="text-sm text-red-500">
            {errors.organizationWebsite.message as string}
          </p>
        )}
      </div>
      <div>
        <Label
          className="text-primary-foreground/45"
          htmlFor="organizationAddress"
        >
          Address
        </Label>
        <Input {...register('organizationAddress')} placeholder="Address" />
        {errors.organizationAddress && (
          <p className="text-sm text-red-500">
            {errors.organizationAddress.message as string}
          </p>
        )}
      </div>
      <div>
        <Label
          className="text-primary-foreground/45"
          htmlFor="organizationCountry"
        >
          Country{' '}
        </Label>
        <Input {...register('organizationCountry')} placeholder="Country" />
        {errors.organizationCountry && (
          <p className="text-sm text-red-500">
            {errors.organizationCountry.message as string}
          </p>
        )}
      </div>
      <div>
        <Label
          className="text-primary-foreground/45"
          htmlFor="organizationTimezone"
        >
          Timezone
        </Label>
        <Input {...register('organizationTimezone')} placeholder="Timezone" />
        {errors.organizationTimezone && (
          <p className="text-sm text-red-500">
            {errors.organizationTimezone.message as string}
          </p>
        )}
      </div>
    </section>
  );
}

export default MoreOrgDetails;
