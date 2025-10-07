import { AuthProvider } from '@/providers/AuthProvider';
import React from 'react';
import SidePanel from './dashboard/_component/shared/SidePanel';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <SidePanel
        activeTab={''}
        onTabChange={function (tab: string): void {
          throw new Error('Function not implemented.');
        }}
      />
      {/* <AuthProvider>{children}</AuthProvider> */}
      {children}
    </main>
  );
}
