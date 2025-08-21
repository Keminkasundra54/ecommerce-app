import Sidebar from '@/components/Sidebar';
import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <div className="md:grid md:grid-cols-[16rem,1fr]">
        <Sidebar />
        <main className="p-3 md:p-6">
          {/* Optional top header inside content */}
          <div className="hidden md:block mb-4">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
