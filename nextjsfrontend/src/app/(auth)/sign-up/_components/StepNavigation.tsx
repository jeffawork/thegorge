'use client';
import { Button } from '@/components/ui/button';
import { useFormContext } from 'react-hook-form';
import { useRegistrationStore } from './_store/useRegistrationStore';

interface Props {
  total: number;
  onNavigate?: (dir: number) => void;
  onSubmit?: (data: any) => void;
  stepFields: string[][]; // each array = fields in that step
}

export const StepNavigation = ({ total, onNavigate, stepFields }: Props) => {
  const { step, prevStep, nextStep } = useRegistrationStore();
  const { trigger } = useFormContext();

  const handleNextStep = async () => {
    const currentFields = stepFields[step] || [];
    const isValid = await trigger(currentFields);
    if (!isValid) return;
    onNavigate?.(1);
    nextStep();
  };

  const handlePrevStep = () => {
    onNavigate?.(-1);
    prevStep();
  };

  return (
    <div className="mx-auto mt-4 flex max-w-md items-center justify-between">
      {step > 0 && (
        <Button variant="secondary" type="button" onClick={handlePrevStep}>
          Previous
        </Button>
      )}

      {step < total - 1 ? (
        <Button variant="secondary" type="button" onClick={handleNextStep}>
          Next
        </Button>
      ) : (
        <Button type="submit">Register</Button>
      )}
    </div>
  );
};
