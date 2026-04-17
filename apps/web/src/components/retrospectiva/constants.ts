import type { RetroPeriod } from '@/types/stats';

export const PERIOD_LABELS: Record<RetroPeriod, string> = {
  month: 'este mês',
  quarter: 'estes 3 meses',
  year: 'este ano',
  all: 'de sempre',
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
