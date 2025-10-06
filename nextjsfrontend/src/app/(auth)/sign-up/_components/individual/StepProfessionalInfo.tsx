import { Input } from '@/components/ui/input';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';

function StepProfessionalInfo() {
  const { register } = useFormContext();

  // Professional Information Step for Individual Registration
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="jobTitle">Job Title</Label>
        <Input {...register('jobTitle')} placeholder="Job Title" />
      </div>
      <div>
        <Label htmlFor="company">Company</Label>
        <Input {...register('company')} placeholder="Company" />
      </div>
      <div>
        <Label htmlFor="website">Website</Label>
        <Input {...register('website')} type="url" />
      </div>
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Input {...register('bio')} placeholder="Bio" />
      </div>
    </div>
  );
}

export default StepProfessionalInfo;
