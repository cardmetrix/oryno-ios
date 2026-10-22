import { useAuth } from '@clerk/clerk-expo';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, type ReactNode } from 'react';

import { useQueryHydrated } from '@/context/query-provider';
import { bootstrapSignedInSession, hasWarmAppCache } from '@/lib/app-boot';

/**
 * Opens the app immediately. Session data loads in the background so the
 * dashboard is not held behind a splash.
 */
export function BootGate({ children }: { children: ReactNode }) {
  const hydrated = useQueryHydrated();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const queryClient = useQueryClient();
  const bootStarted = useRef(false);

  useEffect(() => {
    if (!isSignedIn) {
      bootStarted.current = false;
      return;
    }
    if (!hydrated || !isLoaded) return;
    if (bootStarted.current) return;
    bootStarted.current = true;

    void bootstrapSignedInSession({
      queryClient,
      getToken,
      warm: hasWarmAppCache(queryClient),
    }).catch((error) => {
      if (__DEV__) console.warn('[ORYNO boot] bootstrap failed', error);
    });
  }, [hydrated, isLoaded, isSignedIn, queryClient, getToken]);

  return children;
}
