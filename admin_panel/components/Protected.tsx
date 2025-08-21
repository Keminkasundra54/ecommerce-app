'use client';
import { ReactNode, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { useRouter } from 'next/navigation';

export default function Protected({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== 'admin') {
      router.replace('/login');
    }
  }, [user, ready, router]);

  if (!ready) return <div className="container py-10">Loading...</div>;
  if (!user || user.role !== 'admin') return null;
  return <>{children}</>;
}