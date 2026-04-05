import { Genero } from './genero';
import { Temporada } from './temporada';

export type WatchItemTipo = 'filme' | 'serie' | 'livro';

export type WatchItemStatus =
  | 'assistido'
  | 'assistindo'
  | 'quero_assistir'
  | 'abandonado';

export type WatchItem = {
  id: string;
  titulo: string;
  tituloOriginal?: string | null;
  anoLancamento: number;
  tipo: WatchItemTipo;
  status: WatchItemStatus;
  notaDele?: number | null;
  notaDela?: number | null;
  notaGeral?: number | null;
  dataAssistida?: string | null;
  rewatchCount: number;
  observacoes?: string | null;
  posterUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  generos: Genero[];
  temporadas: Temporada[];
};

export type WatchItemsResponse = {
  data: WatchItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type CreateWatchItemPayload = {
  titulo: string;
  tituloOriginal?: string;
  anoLancamento?: number;
  tipo: WatchItemTipo;
  status: WatchItemStatus;
  notaDele?: number;
  notaDela?: number;
  dataAssistida?: string;
  rewatchCount?: number;
  observacoes?: string;
  posterUrl?: string;
  generosIds: string[];
};