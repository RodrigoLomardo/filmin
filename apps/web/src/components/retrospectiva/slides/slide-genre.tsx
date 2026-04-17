'use client';

import { motion } from 'framer-motion';
import type { RetroData } from '@/types/stats';

interface SlideGenreProps {
  data: RetroData;
  active: boolean;
}

export function SlideGenre({ data, active }: SlideGenreProps) {
  const max = data.genres.distribution[0]?.count ?? 1;

  return (
    <div className="flex w-full max-w-sm flex-col items-center justify-center gap-6 px-8">
      <motion.p
        className="text-xs uppercase tracking-[0.35em] text-zinc-500"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.1 }}
      >
        gênero favorito
      </motion.p>

      <motion.h2
        className="font-cormorant text-5xl font-light italic text-pink-400 md:text-6xl"
        initial={{ opacity: 0, y: 18 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {data.genres.top ?? '—'}
      </motion.h2>

      <div className="w-full space-y-2">
        {data.genres.distribution.map((g, i) => (
          <motion.div
            key={g.nome}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -16 }}
            animate={active ? { opacity: 1, x: 0 } : { opacity: 0 }}
            transition={{ delay: 0.35 + i * 0.08, duration: 0.4, ease: 'easeOut' }}
          >
            <span className="w-24 truncate text-right text-xs text-zinc-400">{g.nome}</span>
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-pink-500"
                initial={{ width: 0 }}
                animate={active ? { width: `${(g.count / max) * 100}%` } : { width: 0 }}
                transition={{ delay: 0.45 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <span className="w-6 text-left text-xs text-zinc-500">{g.count}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
