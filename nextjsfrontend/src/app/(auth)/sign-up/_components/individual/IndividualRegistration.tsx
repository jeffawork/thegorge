'use client';
import { AnimatePresence, motion } from 'framer-motion';
// import { StepPersonalInfo } from './StepPersonalInfo';
// import { StepProfessionalInfo } from './StepProfessionalInfo';
import { StepUseCase } from '../shared/StepUseCase';
import { StepTerms } from '../shared/StepTerms';
import { StepNavigation } from '../StepNavigation';
// import { useRegistrationStore } from '../../_store/useRegistrationStore';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { individualSchema } from '../../_schemas/individualSchema';
import { useState } from 'react';
import { useRegistrationStore } from '../_store/useRegistrationStore';
import StepPersonalInfo from './StepPersonalInfo';
import StepProfessionalInfo from './StepProfessionalInfo';

export const IndividualRegistration = () => {
  const { step, nextStep, prevStep, type } = useRegistrationStore();
  const [direction, setDirection] = useState(1);

  const form = useForm({
    // resolver: zodResolver(individualSchema),
    mode: 'onChange',
  });

  const handleFinalSubmit = (data: any) => {
    console.log('Submitting Individual Registration:', { ...data, type });
    // POST to API...
  };

  const steps = [
    <StepPersonalInfo key={0} />,
    <StepProfessionalInfo key={1} />,
    <StepUseCase key={2} />,
    <StepTerms key={3} onSubmit={handleFinalSubmit} />,
  ];

  return (
    <FormProvider {...form}>
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

      <StepNavigation total={steps.length} onNavigate={setDirection} />
    </FormProvider>
  );
};
