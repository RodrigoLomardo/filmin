import { apiFetch } from './client';
import type { Nudge } from '@/types/nudge';

export async function fetchNudges(): Promise<Nudge[]> {
  return apiFetch<Nudge[]>('/nudges');
}

export async function markNudgeRead(id: string): Promise<void> {
  await apiFetch<{ ok: boolean }>(`/nudges/${id}/read`, { method: 'PATCH' });
}

export async function markAllNudgesRead(): Promise<void> {
  await apiFetch<{ ok: boolean }>('/nudges/read-all', { method: 'DELETE' });
}
