'use client';

import { useEffect, type ReactNode } from 'react';
import { getAnalyticsClient } from '@/lib/firebase/client';

// Initializes Firebase Analytics once on the client after mount.
export function FirebaseProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    getAnalyticsClient();
  }, []);

  return <>{children}</>;
}
