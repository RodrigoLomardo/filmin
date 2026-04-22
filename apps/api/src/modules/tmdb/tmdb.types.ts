export interface TmdbMovieRaw {
  id: number;
  title: string;
  original_title: string;
  release_date?: string;
  poster_path?: string | null;
  overview?: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
}

export interface TmdbTvRaw {
  id: number;
  name: string;
  original_name: string;
  first_air_date?: string;
  poster_path?: string | null;
  overview?: string;
  number_of_seasons?: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
}

export interface TmdbSearchResult {
  tmdbId: number;
  titulo: string;
  tituloOriginal: string;
  anoLancamento: number | null;
  posterUrl: string | null;
  overview: string | null;
  tipo: 'filme' | 'serie';
  totalTemporadas?: number | null;
  generosNomes: string[];
}
