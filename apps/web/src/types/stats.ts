export type RetroPeriod = 'month' | 'quarter' | 'year' | 'all';

export interface RetroHighlightItem {
  id: string;
  titulo: string;
  posterUrl?: string | null;
  nota: number;
  tipo: string;
}

export interface RetroGenreEntry {
  nome: string;
  count: number;
}

export interface RetroData {
  totalItems: number;
  byTipo: { filme: number; serie: number; livro: number };
  genres: {
    top: string | null;
    distribution: RetroGenreEntry[];
  };
  ratings: {
    average?: number | null;
    userA?: number | null;
    userB?: number | null;
  };
  highlights: {
    best: RetroHighlightItem | null;
    worst: RetroHighlightItem | null;
  };
  screenTime: number;
  streak: number;
}
