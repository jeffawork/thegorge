import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';
import { useFormContext } from 'react-hook-form';

function MoreOrgDetails() {
  const { register } = useFormContext();
  return (
    <section className="space-y-2">
      <h1 className="text-gradient mb-2 text-center font-bold">
        More Organization Details
      </h1>
      <div>
        <Label htmlFor="organizationWebsite">Website of Organization</Label>
        <Input {...register('organizationWebsite')} placeholder="Website" />
      </div>
      <div>
        <Label htmlFor="organizationAddress">Address</Label>
        <Input {...register('organizationAddress')} placeholder="Address" />
      </div>
      <div>
        <Label htmlFor="organizationCountry">Country </Label>
        <Input {...register('organizationCountry')} placeholder="Country" />
      </div>
      <div>
        <Label htmlFor="organizationTimezone">Timezone</Label>
        <Input {...register('organizationTimezone')} placeholder="Timezone" />
      </div>
    </section>
  );
}

export default MoreOrgDetails;
