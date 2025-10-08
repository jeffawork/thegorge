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
        <h1 className="text-gradient mb-2 text-center font-bold">
          Organization Details
        </h1>
        <div>
          <Label htmlFor="organizationName">Name of Organization</Label>
          <Input {...register('organizationName')} placeholder="Organization" />
        </div>
        <div>
          <Label htmlFor="organizationSlug">Slug of Organization</Label>
          <Input {...register('organizationSlug')} placeholder="Organization" />
        </div>
        <div>
          <Label htmlFor="organizationDescription">
            Description of Organization
          </Label>
          <Input
            {...register('organizationDescription')}
            placeholder="Description"
          />
        </div>
        <div>
          <Label htmlFor="organizationSize">Size of Organization</Label>
          <Input {...register('organizationSize')} placeholder="Size" />
        </div>
        <div>
          <Label htmlFor="industry">Industry</Label>
          <Input {...register('industry')} placeholder="Industry" />
        </div>
        <div>
          <Label htmlFor="firstName">Contact Person First Name</Label>
          <Input {...register('firstName')} placeholder="Contact Person" />
        </div>
        <div>
          <Label htmlFor="lastName">Contact Person Last Name</Label>
          <Input {...register('lastName')} placeholder="Contact Person" />
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
