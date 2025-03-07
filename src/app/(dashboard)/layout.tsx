'use client';

import { useState, useEffect } from 'react';
import HelpGuide from '@/components/ui/HelpGuide';
import { AppDock } from '@/components/ui/Dock';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <AppDock />
        
        {/* Main content */}
        <main className="flex-1">
          <div className="py-6 pb-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>

        <HelpGuide />
      </div>
    </LanguageProvider>
  );
} 