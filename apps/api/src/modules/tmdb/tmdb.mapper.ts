import type { TmdbMovieRaw, TmdbTvRaw, TmdbSearchResult } from './tmdb.types';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

// Mapeamento de IDs de gênero do TMDB para os nomes dos gêneros do sistema.
// Cobre filmes e séries (alguns IDs são compartilhados).
const TMDB_GENRE_MAP: Record<number, string> = {
  28:    'Ação',
  10759: 'Ação',       // TV: Action & Adventure
  12:    'Aventura',
  16:    'Animação',
  35:    'Comédia',
  80:    'Crime',
  99:    'Documentário',
  18:    'Drama',
  14:    'Fantasia',
  10765: 'Ficção Científica', // TV: Sci-Fi & Fantasy
  27:    'Terror',
  9648:  'Suspense',   // Mystery
  10749: 'Romance',
  878:   'Ficção Científica',
  53:    'Suspense',
  10402: 'Romance',    // Music → Romance (melhor aproximação)
};

function extractYear(dateStr?: string): number | null {
  if (!dateStr) return null;
  const year = new Date(dateStr).getFullYear();
  return isNaN(year) ? null : year;
}

function mapGenreIds(ids: number[] = []): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const id of ids) {
    const nome = TMDB_GENRE_MAP[id];
    if (nome && !seen.has(nome)) {
      seen.add(nome);
      result.push(nome);
    }
  }
  return result;
}

export function mapMovie(raw: TmdbMovieRaw): TmdbSearchResult {
  const ids = raw.genre_ids ?? raw.genres?.map((g) => g.id) ?? [];
  return {
    tmdbId: raw.id,
    titulo: raw.title,
    tituloOriginal: raw.original_title,
    anoLancamento: extractYear(raw.release_date),
    posterUrl: raw.poster_path ? `${POSTER_BASE}${raw.poster_path}` : null,
    overview: raw.overview ?? null,
    tipo: 'filme',
    generosNomes: mapGenreIds(ids),
  };
}

export function mapTv(raw: TmdbTvRaw): TmdbSearchResult {
  const ids = raw.genre_ids ?? raw.genres?.map((g) => g.id) ?? [];
  return {
    tmdbId: raw.id,
    titulo: raw.name,
    tituloOriginal: raw.original_name,
    anoLancamento: extractYear(raw.first_air_date),
    posterUrl: raw.poster_path ? `${POSTER_BASE}${raw.poster_path}` : null,
    overview: raw.overview ?? null,
    tipo: 'serie',
    totalTemporadas: raw.number_of_seasons ?? null,
    generosNomes: mapGenreIds(ids),
  };
}
