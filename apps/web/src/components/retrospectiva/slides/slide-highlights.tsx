'use client';

import { motion } from 'framer-motion';
import { PosterCard } from '../poster-card';
import type { RetroData } from '@/types/stats';

interface SlideHighlightsProps {
  data: RetroData;
  active: boolean;
}

export function SlideHighlights({ data, active }: SlideHighlightsProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 px-8 text-center">
      <motion.p
        className="text-xs uppercase tracking-[0.35em] text-zinc-500"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.1 }}
      >
        destaques
      </motion.p>

      <div className="flex gap-10">
        <PosterCard
          item={data.highlights.best}
          label="melhor"
          labelColor="text-pink-400"
          active={active}
          delay={0.25}
        />
        <PosterCard
          item={data.highlights.worst}
          label="pior"
          labelColor="text-zinc-500"
          active={active}
          delay={0.4}
        />
      </div>

      {!data.highlights.best && (
        <p className="text-sm text-zinc-600">sem itens avaliados no período</p>
      )}
    </div>
  );
}
