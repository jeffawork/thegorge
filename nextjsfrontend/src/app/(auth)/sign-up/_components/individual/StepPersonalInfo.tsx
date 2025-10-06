import {
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

function StepPersonalInfo() {
  const { register } = useFormContext();

  // Personal Information Step for Individual Registration

  return (
    <section>
      <div className="space-y-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input {...register('firstName')} placeholder="First Name" />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input {...register('lastName')} placeholder="Last Name" />
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
          <Label htmlFor="phone">Phone</Label>
          <Input {...register('phone')} placeholder="Phone" />
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

export default StepPersonalInfo;
