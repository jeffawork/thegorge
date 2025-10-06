import React from 'react';
import SignUpForm from '@/app/(auth)/sign-up/_components/SignUpForm';
import SignInForm from '@/app/(auth)/sign-in/_components/SignInForm';
import ForgotPasswordForm from '@/app/(auth)/forgot-password/_components/ForgotPasswordForm';

const AuthForm = ({ formType }: { formType: AuthFormTypes }) => {
  const formMap: Record<string, React.ReactNode> = {
    'sign-up': <SignUpForm />,
    'sign-in': <SignInForm />,
    'forgot-password': <ForgotPasswordForm />,
  };

  const formComponent = formMap[formType] ?? <p>Form not found.</p>;

  return <div>{formComponent}</div>;
};

export default AuthForm;
