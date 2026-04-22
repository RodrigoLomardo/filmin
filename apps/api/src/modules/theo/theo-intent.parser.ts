import { WatchItemTipo } from '../../common/enums/watch-item-tipo.enum';

export interface ParsedIntent {
  tipoFilter: WatchItemTipo | null;
  isDuoRequest: boolean;
  moodKeywords: string[];
}

const TIPO_MAP: Record<string, WatchItemTipo> = {
  filme: WatchItemTipo.FILME,
  filmes: WatchItemTipo.FILME,
  movie: WatchItemTipo.FILME,
  série: WatchItemTipo.SERIE,
  series: WatchItemTipo.SERIE,
  serie: WatchItemTipo.SERIE,
  séries: WatchItemTipo.SERIE,
  livro: WatchItemTipo.LIVRO,
  livros: WatchItemTipo.LIVRO,
  ler: WatchItemTipo.LIVRO,
  leitura: WatchItemTipo.LIVRO,
};

const DUO_KEYWORDS = [
  'dupla', 'dois', 'casal', 'junto', 'juntos', 'duo',
  'a dois', 'com ela', 'com ele', 'ela', 'ele', 'nós dois', 'nós',
];

const MOOD_KEYWORDS = [
  'ação', 'aventura', 'comédia', 'drama', 'terror', 'horror',
  'romance', 'sci-fi', 'ficção', 'suspense', 'policial', 'animação',
  'documentário', 'fantasia', 'thriller', 'mistério', 'musical',
];

export function parseIntent(message: string): ParsedIntent {
  const lower = message.toLowerCase();

  let tipoFilter: WatchItemTipo | null = null;
  for (const [keyword, tipo] of Object.entries(TIPO_MAP)) {
    if (lower.includes(keyword)) {
      tipoFilter = tipo;
      break;
    }
  }

  const isDuoRequest = DUO_KEYWORDS.some((kw) => lower.includes(kw));

  const moodKeywords = MOOD_KEYWORDS.filter((kw) => lower.includes(kw));

  return { tipoFilter, isDuoRequest, moodKeywords };
}
