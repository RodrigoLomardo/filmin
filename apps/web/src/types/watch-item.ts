import { Genero } from './genero';
import { Temporada } from './temporada';

export type WatchItemTipo = 'filme' | 'serie';

export type WatchItemStatus =
  | 'quero_assistir'
  | 'assistindo'
  | 'assistido'
  | 'abandonado';

export type WatchItem = {
  id: string;
  titulo: string;
  tituloOriginal?: string | null;
  anoLancamento: number;
  tipo: WatchItemTipo;
  status: WatchItemStatus;
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
  anoLancamento: number;
  tipo: WatchItemTipo;
  status: WatchItemStatus;
  notaGeral?: number;
  dataAssistida?: string;
  rewatchCount?: number;
  observacoes?: string;
  posterUrl?: string;
  generosIds: string[];
};