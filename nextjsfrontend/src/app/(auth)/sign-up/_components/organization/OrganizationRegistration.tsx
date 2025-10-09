'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { StepUseCase } from '../shared/StepUseCase';
import { StepTerms } from '../shared/StepTerms';
import { StepNavigation } from '../StepNavigation';
import { FormProvider, useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRegistrationStore } from '../_store/useRegistrationStore';
import StepOrgDetails from './StepOrgDetails';
import OrgPlans from './OrgPlans';
import { organizationSchema } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';

export const OrganizationRegistration = () => {
  const { step, type } = useRegistrationStore();
  const [direction, setDirection] = useState(1);

  const form = useForm<z.infer<typeof organizationSchema>>({
    resolver: zodResolver(organizationSchema),
    mode: 'onChange',
  });

  const stepFields = [
    [
      'organizationName',
      'organizationSlug',
      'organizationDescription',
      'organizationSize',
      'industry',
      'firstName',
      'lastName',
      'email',
      'password',
      'confirmPassword',
    ],
    [
      'organizationWebsite',
      'organizationAddress',
      'organizationCountry',
      'organizationTimezone',
    ],
    ['plan', 'expectedRpcUsage'],
    ['industry', 'useCase', 'blockchainExperience'],
    ['acceptTerms', 'marketingConsent'], // final step
  ];
  const handleFinalSubmit = (data: any) => {
    console.log('Submitting Organization Registration:', { ...data, type });
  };

  const steps = [
    <StepOrgDetails key={0} />,
    <OrgPlans key={1} />,
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
          onSubmit={handleFinalSubmit}
          stepFields={stepFields}
        />
      </form>
    </FormProvider>
  );
};
