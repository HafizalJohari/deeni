'use client';

import { ReactNode, useEffect, useState } from 'react';

interface PersonalizationProviderProps {
  children: ReactNode;
}

export default function PersonalizationProvider({ children }: PersonalizationProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Return a placeholder or loading state during SSR
    return <>{children}</>;
  }

  return <>{children}</>;
} 