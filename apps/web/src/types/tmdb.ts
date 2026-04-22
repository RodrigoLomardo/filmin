export interface TmdbResult {
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
