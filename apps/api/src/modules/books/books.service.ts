import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { GoogleBooksRaw, BookSearchResult } from './books.types';
import { mapBook } from './books.mapper';

const GOOGLE_BOOKS_BASE = 'https://www.googleapis.com/books/v1';
const TIMEOUT_MS = 5_000;
const MAX_RESULTS = 10;

@Injectable()
export class BooksService {
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('GOOGLE_BOOKS_API_KEY') ?? '';
  }

  async search(query: string): Promise<BookSearchResult[]> {
    const params = new URLSearchParams({
      q: query,
      maxResults: String(MAX_RESULTS),
      printType: 'books',
      ...(this.apiKey ? { key: this.apiKey } : {}),
    });
    const url = `${GOOGLE_BOOKS_BASE}/volumes?${params.toString()}`;
    const data = await this.fetchWithRetry<{ items?: GoogleBooksRaw[] }>(url);
    return (data.items ?? []).map(mapBook);
  }

  async findById(id: string): Promise<BookSearchResult> {
    const params = new URLSearchParams(this.apiKey ? { key: this.apiKey } : {});
    const url = `${GOOGLE_BOOKS_BASE}/volumes/${encodeURIComponent(id)}?${params.toString()}`;
    const data = await this.fetchWithRetry<GoogleBooksRaw>(url);
    return mapBook(data);
  }

  private async fetchWithRetry<T>(url: string, attempt = 0): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timer);

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new InternalServerErrorException(
          `Google Books respondeu com status ${res.status}: ${body}`,
        );
      }

      return (await res.json()) as T;
    } catch (err) {
      clearTimeout(timer);

      if (err instanceof InternalServerErrorException) throw err;

      if (attempt === 0) {
        return this.fetchWithRetry<T>(url, 1);
      }

      const message = err instanceof Error ? err.message : String(err);
      throw new InternalServerErrorException(
        `Falha ao comunicar com o Google Books: ${message}`,
      );
    }
  }
}
