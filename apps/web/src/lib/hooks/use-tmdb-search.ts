import { useQuery } from '@tanstack/react-query';
import { searchTmdb } from '@/lib/api/tmdb';
import type { WatchItemTipo } from '@/types/watch-item';

export function useTmdbSearch(query: string, tipo: WatchItemTipo) {
  return useQuery({
    queryKey: ['tmdb-search', query, tipo],
    queryFn: () => searchTmdb(query, tipo as 'filme' | 'serie'),
    enabled: query.trim().length > 2 && (tipo === 'filme' || tipo === 'serie'),
    staleTime: 1000 * 60 * 5,
  });
}
