import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

function StepOrgDetails() {
  const { register } = useFormContext();
  return (
    <section>
      <div className="space-y-2">
        <div>
          <Label htmlFor="orgName">Name of Organization</Label>
          <Input {...register('orgName')} placeholder="Organization" />
        </div>
        <div>
          <Label htmlFor="orgDescription">Description of Organization</Label>
          <Input {...register('orgDescription')} placeholder="Description" />
        </div>
        <div>
          <Label htmlFor="orgSize">Size of Organization</Label>
          <Input {...register('orgSize')} placeholder="Size" />
        </div>
        <div>
          <Label htmlFor="conPerson">Contact Person</Label>
          <Input {...register('conPerson')} placeholder="Contact Person" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            {...register('email')}
            placeholder="Email"
            type="email"
            icon={<Mail />}
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            {...register('password')}
            placeholder="Password"
            type="password"
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            {...register('confirmPassword')}
            placeholder="Confirm Password"
            type="password"
          />
        </div>
      </div>
    </section>
  );
}

export default StepOrgDetails;
