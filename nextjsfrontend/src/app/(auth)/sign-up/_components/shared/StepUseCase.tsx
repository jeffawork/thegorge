'use client';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';

export const StepUseCase = () => {
  const { register } = useFormContext();

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Use Case & Experience</h3>
      <Input {...register('industry')} placeholder="Industry" />
      <Input {...register('useCase')} placeholder="Use Case" />
      <Input {...register('experience')} placeholder="Blockchain Experience" />
    </div>
  );
};
