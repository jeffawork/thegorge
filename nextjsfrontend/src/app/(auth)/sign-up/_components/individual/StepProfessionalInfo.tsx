import { Input } from '@/components/ui/input';
import React from 'react';
import { useFormContext } from 'react-hook-form';

function StepProfessionalInfo() {
  const { register } = useFormContext();
  return (
    <div className="space-y-4">
      <Input {...register('jobTitle')} placeholder="Job Title" />
      <Input {...register('company')} placeholder="Company" />
      <Input {...register('website')} type="url" />
      <Input {...register('bio')} placeholder="Bio" />
    </div>
  );
}

export default StepProfessionalInfo;
