import { useQuery } from '@tanstack/react-query';
import { getPendingRatings } from '@/lib/api/watch-items';
import { useGroupTipo } from './use-group-tipo';

export function usePendingRatings() {
  const groupTipo = useGroupTipo();

  const { data } = useQuery({
    queryKey: ['watch-items', 'pending'],
    queryFn: getPendingRatings,
    enabled: groupTipo === 'duo',
    staleTime: 1000 * 30,
  });

  return data ?? [];
}
