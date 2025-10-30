'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { StepNavigation } from '../shared/StepNavigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRegistrationStore } from '../_store/useRegistrationStore';
import { joinOrgSchema } from '@/lib/utils';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import StepJoinInfo from './StepJoinInfo';
import MoreJoinInfo from './MoreJoinInfo';
import { useRegister } from '@/hooks/useAuth';

export const JoinOrganizationRegistration = () => {
  const { step, registrationType, reset } = useRegistrationStore();
  const [direction, setDirection] = useState(1);
  const { mutate: register } = useRegister();
  const router = useRouter();

  const form = useForm<z.infer<typeof joinOrgSchema>>({
    resolver: zodResolver(joinOrgSchema),
    mode: 'onChange',
  });

  const stepFields = [
    [
      'firstName',
      'lastName',
      'email',
      'OrganizationId',
      'password',
      'confirmPassword',
    ],
    [
      'invitationCode',
      'department',
      'managerEmail',
      'jobTitle',
      'acceptTerms',
      'marketingConsent',
    ], // final step
  ];

  const handleFinalSubmit = (data: any) => {
    const payload = { ...data, registrationType };
    register(payload);
    console.log('Submitting Join Organization Registration:', payload);
    if (payload) {
      router.push('/sign-in');
      // reset();
    }
    // POST to API...

    // console.log('like');
  };

  const steps = [<StepJoinInfo key={0} />, <MoreJoinInfo key={1} />];

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
