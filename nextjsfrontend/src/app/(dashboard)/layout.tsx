import { AuthProvider } from '@/providers/AuthProvider';
import React from 'react';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="bg-foreground">
      {/* <AuthProvider>{children}</AuthProvider> */}
      {children}
    </main>
  );
}
