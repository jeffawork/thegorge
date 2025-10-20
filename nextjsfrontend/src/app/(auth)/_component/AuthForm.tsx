import React from 'react';
import ForgotPasswordForm from '../forgot-password/_components/ForgotPasswordForm';
import SignInForm from '../sign-in/_components/SignInForm';
import SignUpForm from '../sign-up/_components/SignUpForm';

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
