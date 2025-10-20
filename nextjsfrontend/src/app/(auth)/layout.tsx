import React from 'react';
import AuthPosterImage from './_component/AuthPosterImage';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="grid min-h-screen bg-foreground px-6 py-8 md:grid-cols-2">
      <div className="flex items-center justify-center">
        <AuthPosterImage />
      </div>
      <div className="flex min-h-0 items-center justify-center">
        <div className="glass-card max-h-[90vh] w-full max-w-md overflow-y-auto p-8">
          {children}
        </div>
      </div>
    </section>
  );
}
