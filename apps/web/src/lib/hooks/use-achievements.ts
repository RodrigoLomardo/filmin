'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAchievements, checkAchievements } from '@/lib/api/achievements';
import type { Achievement } from '@/types/achievement';

export function useAchievements() {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: getAchievements,
    staleTime: 30_000,
  });
}

/**
 * Mutação que dispara o check de conquistas e retorna as recém-desbloqueadas.
 * Invalida automaticamente o cache de achievements.
 */
export function useCheckAchievements(onNewAchievements?: (a: Achievement[]) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkAchievements,
    onSuccess: (newOnes) => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      if (newOnes.length > 0) {
        onNewAchievements?.(newOnes);
      }
    },
  });
}
