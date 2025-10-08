import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';
import { useFormContext } from 'react-hook-form';

function OrgPlans() {
  const { register } = useFormContext();
  return (
    <section className="space-y-2">
      <h1 className="text-gradient mb-2 text-center font-bold">
        Organization Plans
      </h1>
      <div>
        <Label htmlFor="plan">Plan</Label>
        <Input {...register('plan')} placeholder="Plan" />
      </div>
      <div>
        <Label htmlFor="expectedRpcUsage">Expected RPC Usage</Label>
        <Input
          {...register('expectedRpcUsage')}
          placeholder="Expected RPC Usage"
        />
      </div>
    </section>
  );
}

export default OrgPlans;
