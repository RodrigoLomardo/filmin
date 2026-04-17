import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TmdbMovieRaw, TmdbSearchResult, TmdbTvRaw } from './tmdb.types';
import { mapMovie, mapTv } from './tmdb.mapper';
import { TmdbTipo } from './dto/tmdb-search-query.dto';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TIMEOUT_MS = 5_000;
const MAX_RESULTS = 10;

@Injectable()
export class TmdbService {
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('TMDB_API_KEY') ?? '';
  }

  async search(query: string, tipo: TmdbTipo): Promise<TmdbSearchResult[]> {
    const endpoint = tipo === TmdbTipo.FILME ? 'search/movie' : 'search/tv';
    const url = this.buildUrl(`${TMDB_BASE}/${endpoint}`, {
      query,
      language: 'pt-BR',
      page: '1',
    });

    const data = await this.fetchWithRetry<{ results: (TmdbMovieRaw | TmdbTvRaw)[] }>(url);
    const results = data.results.slice(0, MAX_RESULTS);

    return tipo === TmdbTipo.FILME
      ? (results as TmdbMovieRaw[]).map(mapMovie)
      : (results as TmdbTvRaw[]).map(mapTv);
  }

  async findById(id: number, tipo: TmdbTipo): Promise<TmdbSearchResult> {
    const endpoint = tipo === TmdbTipo.FILME ? `movie/${id}` : `tv/${id}`;
    const url = this.buildUrl(`${TMDB_BASE}/${endpoint}`, { language: 'pt-BR' });
    const data = await this.fetchWithRetry<TmdbMovieRaw | TmdbTvRaw>(url);

    return tipo === TmdbTipo.FILME
      ? mapMovie(data as TmdbMovieRaw)
      : mapTv(data as TmdbTvRaw);
  }

  private buildUrl(base: string, params: Record<string, string>): string {
    const url = new URL(base);
    url.searchParams.set('api_key', this.apiKey);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  }

  private async fetchWithRetry<T>(url: string, attempt = 0): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new InternalServerErrorException(
          `TMDB respondeu com status ${res.status}: ${body}`,
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
        `Falha ao comunicar com o TMDB: ${message}`,
      );
    }
  }
}
