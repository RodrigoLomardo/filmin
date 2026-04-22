import type { TheoQueryPayload, TheoResponse, TheoDebatePayload, TheoDebateResponse } from '@/types/theo';
import { apiFetch } from './client';

export function queryTheo(payload: TheoQueryPayload): Promise<TheoResponse> {
  return apiFetch<TheoResponse>('/theo/query', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function resetTheoSession(sessionId: string): Promise<void> {
  return apiFetch<void>(`/theo/session/${sessionId}`, { method: 'DELETE' });
}

export function debateItems(payload: TheoDebatePayload): Promise<TheoDebateResponse> {
  return apiFetch<TheoDebateResponse>('/theo/debate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
