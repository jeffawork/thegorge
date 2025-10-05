import { AuthProvider } from '@/providers/AuthProvider';
import React from 'react';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section>
      <AuthProvider>{children}</AuthProvider>
      {/* {children} */}
    </section>
  );
}
