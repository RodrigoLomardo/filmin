import type { RetroPeriod, RetroData } from '@/types/stats';

export const PERIOD_LABELS: Record<RetroPeriod, string> = {
  month: 'este mês',
  quarter: 'estes 3 meses',
  year: 'este ano',
  all: 'de sempre',
};

export const STREAK_LABELS: Record<
  RetroData['streakTipo'],
  { singular: string; plural: string; short: string; subtitle: string }
> = {
  daily:   { singular: 'dia',           plural: 'dias',            short: 'd',  subtitle: 'assistindo dias consecutivos' },
  weekend: { singular: 'fim de semana', plural: 'fins de semana',  short: 'fs', subtitle: 'fins de semana consecutivos' },
  monthly: { singular: 'mês',           plural: 'meses',           short: 'm',  subtitle: 'meses consecutivos assistindo' },
};

export const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

export const slideTransition = {
  duration: 0.38,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};
