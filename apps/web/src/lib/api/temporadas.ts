import { apiFetch } from './client';
import { Temporada } from '@/types/temporada';

export type CreateTemporadaPayload = {
  watchItemId: string;
  numero: number;
  notaDele: number;
  notaDela?: number;
};

export type UpdateTemporadaPayload = {
  numero?: number;
  notaDele?: number;
  notaDela?: number;
};

export async function createTemporada(payload: CreateTemporadaPayload) {
  return apiFetch<Temporada>('/temporadas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTemporada(id: string, payload: UpdateTemporadaPayload) {
  return apiFetch<Temporada>(`/temporadas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}