import {
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

function StepPersonalInfo() {
  const { register } = useFormContext();

  return (
    <section>
      <div className="space-y-4">
        <Input {...register('firstName')} placeholder="First Name" />
        <Input {...register('lastName')} placeholder="Last Name" />
        <Input
          {...register('email')}
          placeholder="Email"
          type="email"
          icon={<Mail />}
        />
        <Input {...register('phone')} placeholder="Phone" />
        <Input
          {...register('password')}
          placeholder="Password"
          type="password"
        />
        <Input
          {...register('confirmPassword')}
          placeholder="Confirm Password"
          type="password"
        />
      </div>
    </section>
  );
}

export default StepPersonalInfo;
