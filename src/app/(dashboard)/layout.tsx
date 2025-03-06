'use client';

import { useState, useEffect } from 'react';
import HelpGuide from '@/components/ui/HelpGuide';
import AppSidebar from '@/components/ui/AppSidebar';
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
        <AppSidebar />
        
        {/* Main content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>

        <HelpGuide />
      </div>
    </LanguageProvider>
  );
} 