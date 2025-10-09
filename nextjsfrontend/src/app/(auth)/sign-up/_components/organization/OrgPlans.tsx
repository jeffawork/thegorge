import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';
import { useFormContext } from 'react-hook-form';

function OrgPlans() {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <section className="space-y-2">
      <h1 className="text-gradient mb-2 text-center font-bold">
        Organization Plans
      </h1>
      <div>
        <Label className="text-primary-foreground/45" htmlFor="plan">
          Plan
        </Label>
        <Input {...register('plan')} placeholder="Plan" />
        {errors.plan && (
          <p className="text-sm text-red-500">
            {errors.plan.message as string}
          </p>
        )}
      </div>
      <div>
        <Label
          className="text-primary-foreground/45"
          htmlFor="expectedRpcUsage"
        >
          Expected RPC Usage
        </Label>
        <Input
          {...register('expectedRpcUsage')}
          placeholder="Expected RPC Usage"
        />
        {errors.expectedRpcUsage && (
          <p className="text-sm text-red-500">
            {errors.expectedRpcUsage.message as string}
          </p>
        )}
      </div>
    </section>
  );
}

export default OrgPlans;
