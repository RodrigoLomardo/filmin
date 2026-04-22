import type { TheoQueryPayload, TheoResponse } from '@/types/theo';
import { apiFetch } from './client';

export function queryTheo(payload: TheoQueryPayload): Promise<TheoResponse> {
  return apiFetch<TheoResponse>('/theo/query', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
