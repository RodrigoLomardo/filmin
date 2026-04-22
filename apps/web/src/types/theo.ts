export type TheoIntent =
  | 'recommend_movie'
  | 'recommend_duo'
  | 'surprise_me'
  | 'out_of_scope'
  | 'family_chat';

export type TheoTipoFilter = 'filme' | 'serie' | 'livro';

export interface TheoQueryPayload {
  message: string;
  tipoFilter?: TheoTipoFilter;
  sessionId?: string;
}

export interface TheoResponse {
  intent: TheoIntent;
  message: string;
  suggestions?: string[];
}

export interface TheoMessage {
  id: string;
  role: 'user' | 'theo';
  text: string;
  suggestions?: string[];
  timestamp: Date;
}

// Debate types

export interface TheoDebatePayload {
  itemAId: string;
  itemBId: string;
  sessionId?: string;
}

export interface DebateItem {
  id: string;
  titulo: string;
  posterUrl: string | null;
  anoLancamento: number | null;
  generos: string[];
  notaGeral: number | null;
}

export interface TheoDebateResponse {
  itemA: DebateItem;
  itemB: DebateItem;
  argumentsForA: string[];
  argumentsForB: string[];
  verdict: string;
  winner: 'A' | 'B' | 'tie';
}
