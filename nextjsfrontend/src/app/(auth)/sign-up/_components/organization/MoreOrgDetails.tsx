import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';
import { useFormContext } from 'react-hook-form';

function MoreOrgDetails() {
  const { register } = useFormContext();
  return (
    <section>
      <div>
        <Label htmlFor="organizationWebsite">Website of Organization</Label>
        <Input {...register('organizationWebsite')} placeholder="Website" />
      </div>
      <div>
        <Label htmlFor="orgAddress">Address</Label>
        <Input {...register('orgAddress')} placeholder="Address" />
      </div>
      <div>
        <Label htmlFor="orgCountry">Country </Label>
        <Input {...register('orgCountry')} placeholder="Country" />
      </div>
      <div>
        <Label htmlFor="orgTimezone">Timezone</Label>
        <Input {...register('orgTimezone')} placeholder="Timezone" />
      </div>
    </section>
  );
}

export default MoreOrgDetails;
