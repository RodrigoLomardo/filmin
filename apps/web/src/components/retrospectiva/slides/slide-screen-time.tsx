'use client';

import { motion } from 'framer-motion';
import { useCounted } from '../use-counted';
import type { RetroData } from '@/types/stats';

interface SlideScreenTimeProps {
  data: RetroData;
  active: boolean;
}

export function SlideScreenTime({ data, active }: SlideScreenTimeProps) {
  const hours = useCounted(data.screenTime, active, 1000);

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-8 text-center">
      <motion.p
        className="text-xs uppercase tracking-[0.35em] text-zinc-500"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.1 }}
      >
        tempo de tela
      </motion.p>

      <motion.div
        className="flex items-baseline gap-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="font-cormorant text-8xl font-light leading-none text-pink-400 md:text-9xl">
          {hours}
        </span>
        <span className="text-lg text-zinc-400">horas</span>
      </motion.div>

      <motion.p
        className="text-sm text-zinc-600"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        filmes (2h) + séries (10h)
      </motion.p>
    </div>
  );
}
