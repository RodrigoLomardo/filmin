import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getStreak, setStreakTipo } from '@/lib/api/streak';
import type { StreakTipo } from '@/types/streak';

export function useStreak() {
  return useQuery({
    queryKey: ['streak'],
    queryFn: getStreak,
    staleTime: 1000 * 30,
  });
}

export function useSetStreakTipo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tipo: StreakTipo) => setStreakTipo({ tipo }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['streak'] });
    },
  });
}
