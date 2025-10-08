'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { StepUseCase } from '../shared/StepUseCase';
import { StepTerms } from '../shared/StepTerms';
import { StepNavigation } from '../StepNavigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRegistrationStore } from '../_store/useRegistrationStore';
import StepPersonalInfo from './StepPersonalInfo';
import StepProfessionalInfo from './StepProfessionalInfo';
import { individualSchema } from '@/lib/utils';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

export const IndividualRegistration = () => {
  const { step, type, reset } = useRegistrationStore();
  const [direction, setDirection] = useState(1);
  const router = useRouter();

  const form = useForm<z.infer<typeof individualSchema>>({
    resolver: zodResolver(individualSchema),
    mode: 'onChange',
  });

  const stepFields = [
    ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'],
    ['jobTitle', 'company', 'website', 'bio'],
    ['industry', 'useCase', 'blockchainExperience'],
    ['acceptTerms', 'marketingConsent'], // final step
  ];

  const handleFinalSubmit = (data: any) => {
    console.log('Submitting Individual Registration:', { ...data, type });
    if (data) {
      router.push('/sign-in');
      reset();
    }
    // POST to API...

    // console.log('like');
  };

  const steps = [
    <StepPersonalInfo key={0} />,
    <StepProfessionalInfo key={1} />,
    <StepUseCase key={2} />,
    <StepTerms key={3} />,
  ];

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleFinalSubmit)}>
        <div className="relative w-full max-w-md">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
              transition={{ duration: 0.3 }}
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>
        </div>

        <StepNavigation
          total={steps.length}
          onNavigate={setDirection}
          stepFields={stepFields}
        />
      </form>
    </FormProvider>
  );
};
