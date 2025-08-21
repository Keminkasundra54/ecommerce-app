import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/api';

export const metadata: Metadata = {
  title: 'Admin Panel',
  description: 'Ecommerce Admin Panel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}