import { apiFetch } from './client';
import { Temporada } from '@/types/temporada';

export type CreateTemporadaPayload = {
  watchItemId: string;
  numero: number;
  nota: number;
};

export async function createTemporada(payload: CreateTemporadaPayload) {
  return apiFetch<Temporada>('/temporadas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}