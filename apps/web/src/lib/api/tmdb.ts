import { apiFetch } from './client';
import type { TmdbResult } from '@/types/tmdb';

export function searchTmdb(query: string, tipo: 'filme' | 'serie'): Promise<TmdbResult[]> {
  return apiFetch<TmdbResult[]>('/tmdb/search', { params: { query, tipo } });
}

export function getTmdbById(id: number, tipo: 'filme' | 'serie'): Promise<TmdbResult> {
  return apiFetch<TmdbResult>(`/tmdb/${tipo}/${id}`);
}
