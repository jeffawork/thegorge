'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { StepUseCase } from '../shared/StepUseCase';
import { StepTerms } from '../shared/StepTerms';
import { StepNavigation } from '../StepNavigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { organizationSchema } from '../../_schemas/organizationSchema';
import { useState } from 'react';
import { useRegistrationStore } from '../_store/useRegistrationStore';
import StepOrgDetails from './StepOrgDetails';

export const OrganizationRegistration = () => {
  const { step, type } = useRegistrationStore();
  const [direction, setDirection] = useState(1);

  const form = useForm({
    //   resolver: zodResolver(organizationSchema),
    mode: 'onChange',
  });

  const handleFinalSubmit = (data: any) => {
    console.log('Submitting Organization Registration:', { ...data, type });
  };

  const steps = [
    <StepOrgDetails key={0} />,
    <StepUseCase key={1} />,
    <StepTerms key={2} onSubmit={handleFinalSubmit} />,
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
