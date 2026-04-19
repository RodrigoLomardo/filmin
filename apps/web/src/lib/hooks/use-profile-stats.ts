'use client';

import { useQuery } from '@tanstack/react-query';
import { getProfileStats, type ProfileStats } from '@/lib/api/profile';

export function useProfileStats(profileId?: string) {
  return useQuery<ProfileStats>({
    queryKey: ['profile-stats', profileId],
    queryFn: getProfileStats,
    enabled: !!profileId,
    staleTime: 60_000,
  });
}
