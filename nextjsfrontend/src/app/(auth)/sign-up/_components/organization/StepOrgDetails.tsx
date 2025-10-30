import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

function StepOrgDetails() {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <section>
      <div className="space-y-2">
        <h1 className="text-gradient mb-2 text-center font-bold">
          Organization Details
        </h1>
        <div>
          <Label
            className="text-primary-foreground/45"
            htmlFor="organizationName"
          >
            Name of Organization
          </Label>
          <Input {...register('organizationName')} placeholder="Organization" />
          {errors.organizationName && (
            <p className="text-sm text-red-500">
              {errors.organizationName.message as string}
            </p>
          )}
        </div>
        <div>
          <Label
            className="text-primary-foreground/45"
            htmlFor="organizationSlug"
          >
            Slug of Organization
          </Label>
          <Input
            {...register('organizationSlug')}
            placeholder="Organization Slug"
          />
          {errors.organizationSlug && (
            <p className="text-sm text-red-500">
              {errors.organizationSlug.message as string}
            </p>
          )}
        </div>
        <div>
          <Label
            className="text-primary-foreground/45"
            htmlFor="organizationDescription"
          >
            Description of Organization
          </Label>
          <Input
            {...register('organizationDescription')}
            placeholder="Description"
          />
          {errors.organizationDescription && (
            <p className="text-sm text-red-500">
              {errors.organizationDescription.message as string}
            </p>
          )}
        </div>
        <div>
          <Label
            className="text-primary-foreground/45"
            htmlFor="organizationSize"
          >
            Size of Organization
          </Label>
          <Input {...register('organizationSize')} placeholder="Size" />
          {errors.organizationSize && (
            <p className="text-sm text-red-500">
              {errors.organizationSize.message as string}
            </p>
          )}
        </div>
        <div>
          <Label className="text-primary-foreground/45" htmlFor="firstName">
            Contact Person First Name
          </Label>
          <Input {...register('firstName')} placeholder="Contact Person" />
          {errors.firstName && (
            <p className="text-sm text-red-500">
              {errors.firstName.message as string}
            </p>
          )}
        </div>
        <div>
          <Label className="text-primary-foreground/45" htmlFor="lastName">
            Contact Person Last Name
          </Label>
          <Input {...register('lastName')} placeholder="Contact Person" />
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
            htmlFor="confirm_password"
          >
            Confirm Password
          </Label>
          <Input
            {...register('confirm_password')}
            placeholder="Confirm Password"
            type="password"
            variant="password"
          />
          {errors.confirm_password && (
            <p className="text-sm text-red-500">
              {errors.confirm_password.message as string}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default StepOrgDetails;
