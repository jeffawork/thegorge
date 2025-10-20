import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

function StepPersonalInfo() {
  const {
    register,
    formState: { errors },
    trigger,
    getValues,
  } = useFormContext();

  // Personal Information Step for Individual Registration

  return (
    <section>
      <div className="space-y-2">
        <h1 className="text-gradient mb-2 text-center font-bold">
          Personal Information
        </h1>
        <div>
          <Label className="text-primary-foreground/45" htmlFor="firstName">
            First Name
          </Label>
          <Input {...register('firstName')} placeholder="First Name" />
          {errors.firstName && (
            <p className="text-sm text-red-500">
              {errors.firstName.message as string}
            </p>
          )}
        </div>
        <div>
          <Label className="text-primary-foreground/45" htmlFor="lastName">
            Last Name
          </Label>
          <Input {...register('lastName')} placeholder="Last Name" />
          {errors.lastName && (
            <p className="text-sm text-red-500">
              {errors.lastName.message as string}
            </p>
          )}
        </div>
        <div>
          <Label className="text-primary-foreground/45" htmlFor="email">
            Email
          </Label>
          <Input
            {...register('email')}
            placeholder="Email"
            type="email"
            icon={<Mail />}
          />
          {errors.email && (
            <p className="text-sm text-red-500">
              {errors.email.message as string}
            </p>
          )}
        </div>
        <div>
          <Label className="text-primary-foreground/45" htmlFor="phone">
            Phone
          </Label>
          <Input {...register('phone')} placeholder="Phone" />
          {errors.phone && (
            <p className="text-sm text-red-500">
              {errors.phone.message as string}
            </p>
          )}
        </div>
        <div>
          <Label className="text-primary-foreground/45" htmlFor="password">
            Password
          </Label>
          <Input
            {...register('password')}
            placeholder="Password"
            type="password"
            variant="password"
          />
          {errors.password && (
            <p className="text-sm text-red-500">
              {errors.password.message as string}
            </p>
          )}
        </div>
        <div>
          <Label
            className="text-primary-foreground/45"
            htmlFor="confirmPassword"
          >
            Confirm Password
          </Label>
          <Input
            {...register('confirmPassword')}
            placeholder="Confirm Password"
            type="password"
            variant="password"
            onChange={(e) => {
              // Update field and validate in real time
              trigger('confirmPassword');
            }}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">
              {errors.confirmPassword.message as string}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default StepPersonalInfo;
