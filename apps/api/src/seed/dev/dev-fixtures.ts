/**
 * Dados de teste do ambiente de dev.
 *
 * Cada conjunto cobre deliberadamente uma regra de negócio crítica — ver
 * comentários por bloco. Alterar aqui é a forma de ajustar os cenários.
 */

import { RatingField } from '../../common/enums/rating-field.enum';
import { RatingStatus } from '../../common/enums/rating-status.enum';
import { WatchItemStatus } from '../../common/enums/watch-item-status.enum';
import { WatchItemTipo } from '../../common/enums/watch-item-tipo.enum';

const { FILME, SERIE, LIVRO } = WatchItemTipo;
const { QUERO_ASSISTIR, ASSISTINDO, ASSISTIDO, ABANDONADO } = WatchItemStatus;

export interface TemporadaFixture {
  numero: number;
  notaDele?: number;
  notaDela?: number;
  notaGeral?: number;
}

export interface ItemFixture {
  titulo: string;
  tipo: WatchItemTipo;
  status: WatchItemStatus;
  ano?: number;
  generos?: string[];
  notaDele?: number;
  notaDela?: number;
  notaGeral?: number;
  /** Dias atrás — define `data_assistida` e `created_at`, espalhando o acervo no tempo. */
  diasAtras?: number;
  temporadas?: TemporadaFixture[];
  observacoes?: string;
  ratingStatus?: RatingStatus;
  pendingFor?: 'pai' | 'mae';
  firstRatingBy?: 'pai' | 'mae';
  firstRatingField?: RatingField;
  rewatchCount?: number;
}

/**
 * Acervo do grupo DUO (pai + mãe).
 *
 * Os 10 primeiros itens têm `notaDele === notaDela` de propósito: é a condição
 * da conquista `alma_gemea` (duo_only). Há também um item em
 * `awaiting_partner` para exercitar a sincronização de notas do Duo.
 */
// prettier-ignore
export const DUO_ITEMS: ItemFixture[] = [
  { titulo: 'Interestelar', tipo: FILME, status: ASSISTIDO, ano: 2014, generos: ['Ficção Científica', 'Drama'], notaDele: 10, notaDela: 10, notaGeral: 10, diasAtras: 12, ratingStatus: RatingStatus.COMPLETE },
  { titulo: 'Parasita', tipo: FILME, status: ASSISTIDO, ano: 2019, generos: ['Suspense', 'Drama'], notaDele: 9, notaDela: 9, notaGeral: 9, diasAtras: 25, ratingStatus: RatingStatus.COMPLETE },
  { titulo: 'A Origem', tipo: FILME, status: ASSISTIDO, ano: 2010, generos: ['Ficção Científica', 'Ação'], notaDele: 9.5, notaDela: 9.5, notaGeral: 9.5, diasAtras: 40, rewatchCount: 2, ratingStatus: RatingStatus.COMPLETE },
  { titulo: 'Clube da Luta', tipo: FILME, status: ASSISTIDO, ano: 1999, generos: ['Drama', 'Suspense'], notaDele: 8.5, notaDela: 8.5, notaGeral: 8.5, diasAtras: 58, ratingStatus: RatingStatus.COMPLETE },
  { titulo: 'Cidade de Deus', tipo: FILME, status: ASSISTIDO, ano: 2002, generos: ['Crime', 'Drama'], notaDele: 10, notaDela: 10, notaGeral: 10, diasAtras: 73, ratingStatus: RatingStatus.COMPLETE },
  { titulo: 'Soul', tipo: FILME, status: ASSISTIDO, ano: 2020, generos: ['Animação', 'Fantasia'], notaDele: 8, notaDela: 8, notaGeral: 8, diasAtras: 95, ratingStatus: RatingStatus.COMPLETE },
  { titulo: 'O Fabuloso Destino de Amélie', tipo: FILME, status: ASSISTIDO, ano: 2001, generos: ['Romance', 'Comédia'], notaDele: 9, notaDela: 9, notaGeral: 9, diasAtras: 120, ratingStatus: RatingStatus.COMPLETE },
  { titulo: 'Spirited Away', tipo: FILME, status: ASSISTIDO, ano: 2001, generos: ['Animação', 'Fantasia'], notaDele: 9.5, notaDela: 9.5, notaGeral: 9.5, diasAtras: 150, ratingStatus: RatingStatus.COMPLETE },
  { titulo: 'Whiplash', tipo: FILME, status: ASSISTIDO, ano: 2014, generos: ['Drama'], notaDele: 9, notaDela: 9, notaGeral: 9, diasAtras: 190, ratingStatus: RatingStatus.COMPLETE },
  { titulo: 'Coringa', tipo: FILME, status: ASSISTIDO, ano: 2019, generos: ['Drama', 'Crime'], notaDele: 8, notaDela: 8, notaGeral: 8, diasAtras: 230, ratingStatus: RatingStatus.COMPLETE },

  // Notas divergentes — valida médias por membro na retrospectiva
  { titulo: 'Jogos Mortais', tipo: FILME, status: ASSISTIDO, ano: 2004, generos: ['Terror', 'Suspense'], notaDele: 8, notaDela: 4, notaGeral: 6, diasAtras: 18, ratingStatus: RatingStatus.COMPLETE, observacoes: 'Ela odiou, ele amou.' },
  { titulo: 'Diário de uma Paixão', tipo: FILME, status: ASSISTIDO, ano: 2004, generos: ['Romance', 'Drama'], notaDele: 5, notaDela: 10, notaGeral: 7.5, diasAtras: 65, ratingStatus: RatingStatus.COMPLETE },

  // Aguardando o parceiro avaliar — sincronização Duo
  { titulo: 'Duna: Parte Dois', tipo: FILME, status: ASSISTIDO, ano: 2024, generos: ['Ficção Científica', 'Aventura'], notaDele: 9, notaGeral: 9, diasAtras: 3, ratingStatus: RatingStatus.AWAITING_PARTNER, pendingFor: 'mae', firstRatingBy: 'pai', firstRatingField: RatingField.DELE },

  // Séries com temporadas
  { titulo: 'Dark', tipo: SERIE, status: ASSISTIDO, ano: 2017, generos: ['Ficção Científica', 'Suspense'], notaDele: 10, notaDela: 9.5, notaGeral: 9.8, diasAtras: 48, ratingStatus: RatingStatus.COMPLETE, temporadas: [{ numero: 1, notaDele: 10, notaDela: 9.5, notaGeral: 9.8 }, { numero: 2, notaDele: 9.5, notaDela: 9, notaGeral: 9.3 }, { numero: 3, notaDele: 10, notaDela: 10, notaGeral: 10 }] },
  { titulo: 'The Bear', tipo: SERIE, status: ASSISTINDO, ano: 2022, generos: ['Drama', 'Comédia'], temporadas: [{ numero: 1, notaDele: 9, notaDela: 8.5, notaGeral: 8.8 }, { numero: 2 }] },
  { titulo: 'Succession', tipo: SERIE, status: QUERO_ASSISTIR, ano: 2018, generos: ['Drama'] },

  // Abandonado e fila
  { titulo: 'Emily em Paris', tipo: SERIE, status: ABANDONADO, ano: 2020, generos: ['Comédia', 'Romance'], notaDele: 3, notaDela: 6, notaGeral: 4.5, diasAtras: 80, ratingStatus: RatingStatus.COMPLETE },
  { titulo: 'O Nome do Vento', tipo: LIVRO, status: ASSISTINDO, ano: 2007, generos: ['Fantasia'] },
  { titulo: 'Oppenheimer', tipo: FILME, status: QUERO_ASSISTIR, ano: 2023, generos: ['Drama'] },
  { titulo: 'Shogun', tipo: SERIE, status: QUERO_ASSISTIR, ano: 2024, generos: ['Drama', 'Aventura'] },
];

/**
 * Acervo do grupo SOLO rico — espalhado em ~12 meses para exercitar a
 * retrospectiva em todos os períodos (month, quarter, year, all).
 */
// prettier-ignore
export const SOLO_ITEMS: ItemFixture[] = [
  { titulo: 'Tudo em Todo Lugar ao Mesmo Tempo', tipo: FILME, status: ASSISTIDO, ano: 2022, generos: ['Ficção Científica', 'Comédia'], notaGeral: 9.5, diasAtras: 5 },
  { titulo: 'Pobres Criaturas', tipo: FILME, status: ASSISTIDO, ano: 2023, generos: ['Drama', 'Fantasia'], notaGeral: 8.5, diasAtras: 15 },
  { titulo: 'Anatomia de uma Queda', tipo: FILME, status: ASSISTIDO, ano: 2023, generos: ['Drama', 'Crime'], notaGeral: 9, diasAtras: 22 },
  { titulo: 'Bacurau', tipo: FILME, status: ASSISTIDO, ano: 2019, generos: ['Suspense', 'Ficção Científica'], notaGeral: 8, diasAtras: 44 },
  { titulo: 'Central do Brasil', tipo: FILME, status: ASSISTIDO, ano: 1998, generos: ['Drama'], notaGeral: 9, diasAtras: 70 },
  { titulo: 'Ainda Estou Aqui', tipo: FILME, status: ASSISTIDO, ano: 2024, generos: ['Drama'], notaGeral: 10, diasAtras: 100 },
  { titulo: 'Mad Max: Estrada da Fúria', tipo: FILME, status: ASSISTIDO, ano: 2015, generos: ['Ação', 'Aventura'], notaGeral: 9, diasAtras: 140, rewatchCount: 1 },
  { titulo: 'O Labirinto do Fauno', tipo: FILME, status: ASSISTIDO, ano: 2006, generos: ['Fantasia', 'Terror'], notaGeral: 8.5, diasAtras: 175 },
  { titulo: 'Corra!', tipo: FILME, status: ASSISTIDO, ano: 2017, generos: ['Terror', 'Suspense'], notaGeral: 8, diasAtras: 210 },
  { titulo: 'Her', tipo: FILME, status: ASSISTIDO, ano: 2013, generos: ['Romance', 'Ficção Científica'], notaGeral: 9, diasAtras: 260 },
  { titulo: 'Moonlight', tipo: FILME, status: ASSISTIDO, ano: 2016, generos: ['Drama'], notaGeral: 7.5, diasAtras: 320 },
  { titulo: 'Amadeus', tipo: FILME, status: ASSISTIDO, ano: 1984, generos: ['Drama'], notaGeral: 9, diasAtras: 350 },

  { titulo: 'Breaking Bad', tipo: SERIE, status: ASSISTIDO, ano: 2008, generos: ['Crime', 'Drama'], notaGeral: 10, diasAtras: 60, temporadas: [{ numero: 1, notaGeral: 9 }, { numero: 2, notaGeral: 9.5 }, { numero: 3, notaGeral: 9.5 }, { numero: 4, notaGeral: 10 }, { numero: 5, notaGeral: 10 }] },
  { titulo: 'Severance', tipo: SERIE, status: ASSISTINDO, ano: 2022, generos: ['Ficção Científica', 'Suspense'], temporadas: [{ numero: 1, notaGeral: 9.5 }, { numero: 2 }] },
  { titulo: 'Chernobyl', tipo: SERIE, status: ASSISTIDO, ano: 2019, generos: ['Drama', 'Documentário'], notaGeral: 10, diasAtras: 200, temporadas: [{ numero: 1, notaGeral: 10 }] },

  { titulo: 'Duna', tipo: LIVRO, status: ASSISTIDO, ano: 1965, generos: ['Ficção Científica'], notaGeral: 9.5, diasAtras: 30 },
  { titulo: '1984', tipo: LIVRO, status: ASSISTIDO, ano: 1949, generos: ['Ficção Científica', 'Drama'], notaGeral: 9, diasAtras: 110 },
  { titulo: 'O Hobbit', tipo: LIVRO, status: ASSISTIDO, ano: 1937, generos: ['Fantasia', 'Aventura'], notaGeral: 8.5, diasAtras: 240 },
  { titulo: 'Sapiens', tipo: LIVRO, status: ASSISTIDO, ano: 2011, generos: ['Documentário'], notaGeral: 8, diasAtras: 300 },
  { titulo: 'Neuromancer', tipo: LIVRO, status: ASSISTINDO, ano: 1984, generos: ['Ficção Científica'] },
  // Anos anteriores a 1888 são rejeitados pelo CHECK de `ano_lancamento`, que
  // vale para todos os tipos — livros antigos não podem ser cadastrados hoje.
  { titulo: 'A Revolução dos Bichos', tipo: LIVRO, status: ABANDONADO, ano: 1945, generos: ['Drama'], notaGeral: 5, diasAtras: 160, observacoes: 'Pesado demais para o momento.' },
  { titulo: 'Blade Runner 2049', tipo: FILME, status: QUERO_ASSISTIR, ano: 2017, generos: ['Ficção Científica'] },
  { titulo: 'The Last of Us', tipo: SERIE, status: QUERO_ASSISTIR, ano: 2023, generos: ['Drama', 'Terror'] },
];

/** Acervo pequeno do perfil privado — foco em testar privacidade, não volume. */
// prettier-ignore
export const PRIVADO_ITEMS: ItemFixture[] = [
  { titulo: 'A Chegada', tipo: FILME, status: ASSISTIDO, ano: 2016, generos: ['Ficção Científica', 'Drama'], notaGeral: 9, diasAtras: 10 },
  { titulo: 'Fleabag', tipo: SERIE, status: ASSISTIDO, ano: 2016, generos: ['Comédia', 'Drama'], notaGeral: 10, diasAtras: 35, temporadas: [{ numero: 1, notaGeral: 9.5 }, { numero: 2, notaGeral: 10 }] },
  { titulo: 'O Conto da Aia', tipo: LIVRO, status: ASSISTIDO, ano: 1985, generos: ['Romance', 'Ficção Científica'], notaGeral: 9, diasAtras: 90 },
  { titulo: 'Anora', tipo: FILME, status: QUERO_ASSISTIR, ano: 2024, generos: ['Comédia', 'Drama'] },
];

/** Acervo do duo aberto, aguardando um parceiro entrar pelo convite. */
// prettier-ignore
export const CONVITE_ITEMS: ItemFixture[] = [
  { titulo: 'O Senhor dos Anéis: A Sociedade do Anel', tipo: FILME, status: ASSISTIDO, ano: 2001, generos: ['Fantasia', 'Aventura'], notaDele: 10, notaGeral: 10, diasAtras: 7, ratingStatus: RatingStatus.AWAITING_PARTNER, firstRatingBy: 'pai', firstRatingField: RatingField.DELE },
  { titulo: 'Arcane', tipo: SERIE, status: ASSISTINDO, ano: 2021, generos: ['Animação', 'Ação'], temporadas: [{ numero: 1, notaDele: 10 }] },
  { titulo: 'Pequeno Príncipe', tipo: LIVRO, status: QUERO_ASSISTIR, ano: 1943, generos: ['Fantasia'] },
];

/** Histórico de conversa do Theo — evita gastar quota do Groq para testar memória. */
// prettier-ignore
export const THEO_HISTORY = [
  { role: 'user' as const, content: 'Theo, me indica um filme pra hoje à noite' },
  {
    role: 'assistant' as const,
    content:
      'Vocês dois deram 10 pra Interestelar e Cidade de Deus, então claramente gostam de doer. Que tal Anatomia de uma Queda?',
  },
  { role: 'user' as const, content: 'muito pesado, quero algo leve' },
  {
    role: 'assistant' as const,
    content: 'Leve e bom existe, sim: Soul. Vocês deram 8, vale a revisita.',
  },
];
