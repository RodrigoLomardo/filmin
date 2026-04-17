'use client';

import { motion } from 'framer-motion';
import { PERIOD_LABELS } from '../constants';
import type { RetroPeriod } from '@/types/stats';

interface SlideIntroProps {
  period: RetroPeriod;
  active: boolean;
}

export function SlideIntro({ period, active }: SlideIntroProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-8 text-center">
      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="h-64 w-64 rounded-full bg-pink-500/15 blur-3xl" />
      </motion.div>

      <motion.p
        className="text-xs uppercase tracking-[0.35em] text-pink-400"
        initial={{ opacity: 0, y: 10 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        filmin · retrospectiva
      </motion.p>

      <motion.h1
        className="font-cormorant text-5xl font-light italic leading-tight text-white md:text-6xl"
        initial={{ opacity: 0, y: 20 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ delay: 0.28, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        seu resumo
        <br />
        <span className="text-pink-400">{PERIOD_LABELS[period]}</span>
      </motion.h1>

      <motion.p
        className="text-sm text-zinc-500"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
      >
        toque para avançar
      </motion.p>
    </div>
  );
}
