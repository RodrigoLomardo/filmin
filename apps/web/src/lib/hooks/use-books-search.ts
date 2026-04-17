import { useQuery } from '@tanstack/react-query';
import { searchBooks } from '@/lib/api/books';

export function useBooksSearch(query: string) {
  return useQuery({
    queryKey: ['books-search', query],
    queryFn: () => searchBooks(query),
    enabled: query.trim().length > 2,
    staleTime: 1000 * 60 * 5,
  });
}
