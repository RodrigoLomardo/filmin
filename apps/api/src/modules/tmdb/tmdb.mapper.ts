import type { TmdbMovieRaw, TmdbTvRaw, TmdbSearchResult } from './tmdb.types';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

function extractYear(dateStr?: string): number | null {
  if (!dateStr) return null;
  const year = new Date(dateStr).getFullYear();
  return isNaN(year) ? null : year;
}

export function mapMovie(raw: TmdbMovieRaw): TmdbSearchResult {
  return {
    tmdbId: raw.id,
    titulo: raw.title,
    tituloOriginal: raw.original_title,
    anoLancamento: extractYear(raw.release_date),
    posterUrl: raw.poster_path ? `${POSTER_BASE}${raw.poster_path}` : null,
    overview: raw.overview ?? null,
    tipo: 'filme',
  };
}

export function mapTv(raw: TmdbTvRaw): TmdbSearchResult {
  return {
    tmdbId: raw.id,
    titulo: raw.name,
    tituloOriginal: raw.original_name,
    anoLancamento: extractYear(raw.first_air_date),
    posterUrl: raw.poster_path ? `${POSTER_BASE}${raw.poster_path}` : null,
    overview: raw.overview ?? null,
    tipo: 'serie',
    totalTemporadas: raw.number_of_seasons ?? null,
  };
}
