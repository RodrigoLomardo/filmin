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

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function parseIntent(message: string): ParsedIntent {
  const normalized = normalize(message);

  let tipoFilter: WatchItemTipo | null = null;
  for (const [keyword, tipo] of Object.entries(TIPO_MAP)) {
    if (normalized.includes(normalize(keyword))) {
      tipoFilter = tipo;
      break;
    }
  }

  const isDuoRequest = DUO_KEYWORDS.some((kw) => normalized.includes(normalize(kw)));

  const moodKeywords = MOOD_KEYWORDS.filter((kw) => normalized.includes(normalize(kw)));

  return { tipoFilter, isDuoRequest, moodKeywords };
}
