import AuthPosterImage from '@/components/AuthComponents/AuthPosterImage';
import React from 'react';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="grid min-h-screen place-items-center bg-foreground px-6 py-8 md:grid-cols-2">
      <div>
        <AuthPosterImage />
      </div>
      <div className="glass-card w-full max-w-md p-8">
        <div>{children}</div>
      </div>
    </section>
  );
}
