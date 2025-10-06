'use client';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const StepUseCase = () => {
  const { register } = useFormContext();

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Use Case & Experience</h3>
      <div>
        <Label htmlFor="industry">Industry</Label>
        <Input {...register('industry')} placeholder="Industry" />
      </div>
      <div>
        <Label htmlFor="useCase">Use Case</Label>
        <Input {...register('useCase')} placeholder="Use Case" />
      </div>
      <div>
        <Label htmlFor="experience">Blockchain Experience</Label>
        <Input
          {...register('experience')}
          placeholder="Blockchain Experience"
        />
      </div>
    </div>
  );
};
