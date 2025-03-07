import React from 'react';
import type { Metadata } from 'next';
import AppSidebar from '@/components/ui/AppSidebar';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Personalization | Deeni',
  description: 'Personalized Islamic content and spiritual growth tools',
};

export default function StandalonePersonalizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar />
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
      <Toaster richColors position="bottom-right" />
    </div>
  );
} 