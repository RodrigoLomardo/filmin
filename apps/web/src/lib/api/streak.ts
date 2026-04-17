import { apiFetch } from './client';
import type { Streak, SetStreakTipoPayload } from '@/types/streak';

export function getStreak(): Promise<Streak> {
  return apiFetch<Streak>('/streak');
}

export function setStreakTipo(payload: SetStreakTipoPayload): Promise<Streak> {
  return apiFetch<Streak>('/streak/tipo', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
