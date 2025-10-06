'use client';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const StepUseCase = () => {
  const { register } = useFormContext();

  return (
    <div className="space-y-2">
      <h1 className="text-gradient mb-2 text-center font-bold">
        Use Case Information
      </h1>
      <div>
        <Label className="text-primary-foreground/45" htmlFor="industry">
          Industry
        </Label>
        <Input {...register('industry')} placeholder="Industry" />
      </div>
      <div>
        <Label className="text-primary-foreground/45" htmlFor="useCase">
          Use Case
        </Label>
        <Input {...register('useCase')} placeholder="Use Case" />
      </div>
      <div>
        <Label className="text-primary-foreground/45" htmlFor="experience">
          Blockchain Experience
        </Label>
        <Input
          {...register('experience')}
          placeholder="Blockchain Experience"
        />
      </div>
    </div>
  );
};
