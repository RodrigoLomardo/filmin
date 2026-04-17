'use client';

import { motion } from 'framer-motion';
import type { RetroPeriod } from '@/types/stats';

const PERIODS: { value: RetroPeriod; label: string; sub: string }[] = [
  { value: 'month',   label: 'este mês',   sub: 'últimos 30 dias' },
  { value: 'quarter', label: '3 meses',    sub: 'últimos 90 dias' },
  { value: 'year',    label: 'este ano',   sub: `em ${new Date().getFullYear()}` },
  { value: 'all',     label: 'todo tempo', sub: 'desde o início' },
];

interface PeriodSelectorProps {
  selected: RetroPeriod | null;
  onSelect: (period: RetroPeriod) => void;
}

export function PeriodSelector({ selected, onSelect }: PeriodSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs uppercase tracking-[0.3em] text-zinc-600">escolha o período</p>
      <div className="grid grid-cols-2 gap-3">
        {PERIODS.map((p) => {
          const isActive = selected === p.value;
          return (
            <motion.button
              key={p.value}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(p.value)}
              className={[
                'flex flex-col items-start gap-1 rounded-2xl p-4 text-left ring-1 transition-colors',
                isActive
                  ? 'bg-pink-500/10 ring-pink-500/50'
                  : 'bg-zinc-900 ring-white/5 hover:ring-white/15',
              ].join(' ')}
            >
              <span
                className={[
                  'font-cormorant text-xl font-light italic',
                  isActive ? 'text-pink-400' : 'text-white',
                ].join(' ')}
              >
                {p.label}
              </span>
              <span className="text-[11px] text-zinc-500">{p.sub}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
