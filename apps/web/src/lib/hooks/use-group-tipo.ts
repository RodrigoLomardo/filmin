import { useQuery } from '@tanstack/react-query';
import { getMyGroup } from '@/lib/api/groups';

export function useGroupTipo() {
  const { data: group } = useQuery({
    queryKey: ['group'],
    queryFn: getMyGroup,
    staleTime: 1000 * 60 * 5,
  });
  return group?.tipo ?? null;
}
