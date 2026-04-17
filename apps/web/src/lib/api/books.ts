import { apiFetch } from './client';
import type { BookResult } from '@/types/book';

export function searchBooks(query: string): Promise<BookResult[]> {
  return apiFetch<BookResult[]>('/books/search', { params: { query } });
}

export function getBookById(id: string): Promise<BookResult> {
  return apiFetch<BookResult>(`/books/${encodeURIComponent(id)}`);
}
