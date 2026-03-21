import { apiFetch } from './client';
import {
  CreateWatchItemPayload,
  WatchItemsResponse,
  WatchItem,
  WatchItemStatus,
  WatchItemTipo,
} from '@/types/watch-item';

type GetWatchItemsParams = {
  page?: number;
  limit?: number;
  tipo?: WatchItemTipo;
  status?: WatchItemStatus;
  search?: string;
  sortBy?: 'titulo' | 'notaGeral' | 'dataAssistida' | 'createdAt' | 'anoLancamento';
  sortOrder?: 'ASC' | 'DESC';
};

export async function getWatchItems(params: GetWatchItemsParams = {}) {
  return apiFetch<WatchItemsResponse>('/watch-items', {
    method: 'GET',
    params,
  });
}

export async function getWatchItemById(id: string) {
  return apiFetch<WatchItem>(`/watch-items/${id}`);
}

export async function createWatchItem(payload: CreateWatchItemPayload) {
  return apiFetch<WatchItem>('/watch-items', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}