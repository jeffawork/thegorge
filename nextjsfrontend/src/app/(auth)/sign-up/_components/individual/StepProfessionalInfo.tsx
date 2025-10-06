import { Input } from '@/components/ui/input';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';

function StepProfessionalInfo() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  // Professional Information Step for Individual Registration
  return (
    <div className="space-y-2">
      <h1 className="text-gradient mb-2 text-center font-bold">
        Professional Information
      </h1>

      <div>
        <Label className="text-primary-foreground/45" htmlFor="jobTitle">
          Job Title
        </Label>
        <Input {...register('jobTitle')} placeholder="Job Title" />
        {errors.jobTitle && (
          <p className="text-sm text-red-500">
            {errors.jobTitle.message as string}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="company">Company</Label>
        <Input {...register('company')} placeholder="Company" />
        {errors.company && (
          <p className="text-sm text-red-500">
            {errors.company.message as string}
          </p>
        )}
      </div>
      <div>
        <Label className="text-primary-foreground/45" htmlFor="website">
          Website
        </Label>
        <Input {...register('website')} type="url" />
        {errors.website && (
          <p className="text-sm text-red-500">
            {errors.website.message as string}
          </p>
        )}
      </div>
      <div>
        <Label className="text-primary-foreground/45" htmlFor="bio">
          Bio
        </Label>
        <Input {...register('bio')} placeholder="Bio" />
        {errors.bio && (
          <p className="text-sm text-red-500">{errors.bio.message as string}</p>
        )}
      </div>
    </div>
  );
}

export default StepProfessionalInfo;
