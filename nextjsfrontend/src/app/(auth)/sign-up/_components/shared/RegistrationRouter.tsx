// src/app/(auth)/register/_components/RegistrationRouter.tsx
'use client';
import { RegistrationTypeSelector } from './RegistrationTypeSelector';
import { useRegistrationStore } from '../_store/useRegistrationStore';
import { IndividualRegistration } from '../individual/IndividualRegistration';
import { OrganizationRegistration } from '../organization/OrganizationRegistration';
import { JoinOrganizationRegistration } from '../Join/JoinOrganizationRegistration';

export const RegistrationRouter = () => {
  const { registrationType } = useRegistrationStore();

  if (!registrationType) return <RegistrationTypeSelector />;

  switch (registrationType) {
    case 'individual':
      return <IndividualRegistration />;
    case 'organization':
      return <OrganizationRegistration />;
    case 'join_organization':
      return <JoinOrganizationRegistration />;
    default:
      return <p>Coming soon</p>;
  }
};
