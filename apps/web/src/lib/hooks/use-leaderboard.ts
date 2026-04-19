import { useQuery } from '@tanstack/react-query';
import { getLeaderboard } from '@/lib/api/achievements';
import type { LeaderboardCategory } from '@/types/achievement';

export function useLeaderboard(category: LeaderboardCategory) {
  return useQuery({
    queryKey: ['leaderboard', category],
    queryFn: () => getLeaderboard(category),
    staleTime: 1000 * 60 * 5, // 5 min
  });
}
