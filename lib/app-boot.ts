import type { QueryClient } from '@tanstack/react-query';

import { fetchAds } from '@/hooks/use-ads';
import { fetchNotifications } from '@/hooks/use-notifications-query';
import { fetchProfile } from '@/hooks/use-profile';
import { fetchWallet } from '@/hooks/use-wallet';
import { waitForApiAuth } from '@/lib/api';
import { syncSessionToDatabase } from '@/lib/auth-sync';
import { STALE } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';

export function hasWarmAppCache(queryClient: QueryClient) {
  return Boolean(queryClient.getQueryData(queryKeys.wallet));
}

type GetToken = (opts?: { skipCache?: boolean }) => Promise<string | null | undefined>;

/**
 * Prefetch dashboard data without blocking the first screen.
 * Wallet, profile, and ads start together as soon as a session token exists.
 */
export async function bootstrapSignedInSession(options: {
  queryClient: QueryClient;
  getToken: GetToken;
  warm: boolean;
}) {
  const { queryClient, getToken } = options;

  await waitForApiAuth(4_000);

  let token = await getToken();
  if (!token) token = await getToken({ skipCache: true });
  if (!token) {
    throw new Error('Missing Clerk session token');
  }

  void syncSessionToDatabase().catch(() => undefined);

  void queryClient.prefetchQuery({
    queryKey: queryKeys.wallet,
    queryFn: fetchWallet,
    staleTime: STALE.wallet,
  });
  void queryClient.prefetchQuery({
    queryKey: queryKeys.profile,
    queryFn: fetchProfile,
    staleTime: STALE.profile,
  });
  void queryClient.prefetchQuery({
    queryKey: queryKeys.notifications,
    queryFn: fetchNotifications,
    staleTime: STALE.notifications,
  });
  void queryClient.prefetchQuery({
    queryKey: queryKeys.ads('home_carousel'),
    queryFn: () => fetchAds('home_carousel'),
    staleTime: STALE.ads,
  });
  void queryClient.prefetchQuery({
    queryKey: queryKeys.ads('services_carousel'),
    queryFn: () => fetchAds('services_carousel'),
    staleTime: STALE.ads,
  });
}
