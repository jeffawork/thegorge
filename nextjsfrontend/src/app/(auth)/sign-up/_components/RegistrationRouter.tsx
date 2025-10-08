// src/app/(auth)/register/_components/RegistrationRouter.tsx
'use client';
import JoinOrganizationRegistration from './Join/JoinOrganizationRegistration';
import { RegistrationTypeSelector } from './RegistrationTypeSelector';
import { useRegistrationStore } from './_store/useRegistrationStore';
import { IndividualRegistration } from './individual/IndividualRegistration';
import { OrganizationRegistration } from './organization/OrganizationRegistration';

export const RegistrationRouter = () => {
  const { type } = useRegistrationStore();

  if (!type) return <RegistrationTypeSelector />;

  switch (type) {
    case 'individual':
      return <IndividualRegistration />;
    case 'organization':
      return <OrganizationRegistration />;
    case 'join':
      return <JoinOrganizationRegistration />;
    default:
      return <p>Coming soon</p>;
  }
};
