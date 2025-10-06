import { Button } from '@/components/ui/button';
import { useFormContext } from 'react-hook-form';
import { useRegistrationStore } from './_store/useRegistrationStore';

interface Props {
  total: number;
  onNavigate?: (dir: number) => void;
  onSubmit?: (data: any) => void;
}

export const StepNavigation = ({ total, onNavigate, onSubmit }: Props) => {
  const { step, prevStep, nextStep } = useRegistrationStore();
  const { handleSubmit } = useFormContext();

  return (
    <div className="mx-auto mt-4 flex max-w-md items-center justify-between">
      {step > 0 && (
        <Button
          variant="outline"
          type="button"
          onClick={() => {
            onNavigate?.(-1);
            prevStep();
          }}
        >
          Previous
        </Button>
      )}

      {step < total - 1 ? (
        <Button
          type="button"
          onClick={() => {
            onNavigate?.(1);
            nextStep();
          }}
        >
          Next
        </Button>
      ) : (
        <Button type="submit" onClick={handleSubmit(onSubmit!)}>
          Submit
        </Button>
      )}
    </div>
  );
};
