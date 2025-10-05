// src/app/(auth)/register/_components/StepNavigation.tsx
'use client';
import { Button } from '@/components/ui/button';
import { useRegistrationStore } from './_store/useRegistrationStore';

interface Props {
  total: number;
  onNavigate?: (dir: number) => void;
}

export const StepNavigation = ({ total, onNavigate }: Props) => {
  const { step, prevStep, nextStep, reset } = useRegistrationStore();

  const handlePrev = () => {
    onNavigate?.(-1);
    prevStep();
  };

  const handleNext = () => {
    onNavigate?.(1);
    nextStep();
  };

  return (
    <div className="mx-auto mt-4 flex max-w-md items-center justify-between">
      {step > 0 ? (
        <Button variant="outline" onClick={handlePrev}>
          Previous
        </Button>
      ) : (
        <div />
      )}

      {step < total - 1 ? (
        <Button onClick={handleNext}>Next</Button>
      ) : (
        <Button onClick={() => reset()}>Restart</Button>
      )}
    </div>
  );
};
