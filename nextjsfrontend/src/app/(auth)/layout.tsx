import AuthPosterImage from '@/components/AuthComponents/AuthPosterImage';
import React from 'react';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="min-h-screen bg-foreground">
      <div className="grid place-content-center px-6 py-8">
        <div className="glass-card p-8">
          <div>
            <AuthPosterImage />
          </div>
          <div>{children}</div>
        </div>
      </div>
    </section>
  );
}
