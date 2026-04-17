import { apiFetch } from './client';
import type { RetroPeriod, RetroData } from '@/types/stats';

export function getRetrospective(period: RetroPeriod): Promise<RetroData> {
  return apiFetch<RetroData>('/stats/retrospective', { params: { period } });
}
