import React from 'react';
import ForgotPasswordForm from './ForgotPasswordForm';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

const AuthForm = ({ formType }: { formType: AuthFormTypes }) => {
  const formMap: Record<string, React.ReactNode> = {
    'sign-up': <SignUpForm />,
    'sign-in': <SignInForm />,
    'forgot-password': <ForgotPasswordForm />,
  };

  
  const formComponent = formMap[formType] ?? <p>Form not found.</p>;

  return (<div>
        {formComponent}
  </div>)
};

export default AuthForm;
