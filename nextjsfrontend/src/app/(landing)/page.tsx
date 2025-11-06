'use client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/sign-in'); // 👈 change this to your actual sign-in route if different
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 px-6 text-center text-white">
      <div className="max-w-2xl">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">
          Welcome to <span className="text-gradient">The Gorge</span>
        </h1>
        <p className="mb-8 text-lg text-slate-300 md:text-xl">
          Real-time monitoring platform for smarter, safer, and seamless
          operations.
        </p>
        <Button
          onClick={handleSignIn}
          className="rounded-xl bg-emerald-500 px-6 py-3 text-lg font-medium text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-emerald-600"
        >
          Sign In
        </Button>
      </div>

      <footer className="absolute bottom-4 text-sm text-slate-400">
        © {new Date().getFullYear()} The Gorge Monitoring Platform
      </footer>
    </main>
  );
}
