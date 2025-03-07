import React from 'react';
import type { Metadata } from 'next';
import { AppDock } from '@/components/ui/Dock';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <AppDock />
      <main className="flex-1">
        <div className="py-6 pb-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </main>
      <Toaster richColors position="bottom-right" />
    </div>
  );
} 