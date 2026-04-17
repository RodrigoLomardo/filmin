'use client';

import { motion } from 'framer-motion';
import { useCounted } from '../use-counted';
import type { RetroData } from '@/types/stats';

const TIPO_ITEMS = [
  { key: 'filme' as const, label: 'filmes', color: 'text-pink-400' },
  { key: 'serie' as const, label: 'séries', color: 'text-violet-400' },
  { key: 'livro' as const, label: 'livros', color: 'text-sky-400' },
];

interface SlideTotalsProps {
  data: RetroData;
  active: boolean;
}

export function SlideTotals({ data, active }: SlideTotalsProps) {
  const total = useCounted(data.totalItems, active, 900);
  const filmes = useCounted(data.byTipo.filme, active);
  const series = useCounted(data.byTipo.serie, active);
  const livros = useCounted(data.byTipo.livro, active);

  const counts = { filme: filmes, serie: series, livro: livros };

  return (
    <div className="flex flex-col items-center justify-center gap-8 px-8 text-center">
      <motion.p
        className="text-xs uppercase tracking-[0.35em] text-zinc-500"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.1 }}
      >
        você consumiu
      </motion.p>

      <motion.div
        className="flex items-baseline gap-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="font-cormorant text-8xl font-light leading-none text-white md:text-9xl">
          {total}
        </span>
        <span className="text-lg text-zinc-400">itens</span>
      </motion.div>

      <div className="flex gap-8">
        {TIPO_ITEMS.map((item, i) => (
          <motion.div
            key={item.key}
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, y: 16 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.4, ease: 'easeOut' }}
          >
            <span className={`font-cormorant text-4xl font-light ${item.color}`}>
              {counts[item.key]}
            </span>
            <span className="text-xs text-zinc-500">{item.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
