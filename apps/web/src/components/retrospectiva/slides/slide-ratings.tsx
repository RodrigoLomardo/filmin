'use client';

import { motion } from 'framer-motion';
import type { RetroData } from '@/types/stats';

interface SlideRatingsProps {
  data: RetroData;
  active: boolean;
}

export function SlideRatings({ data, active }: SlideRatingsProps) {
  const isDuo = data.ratings.userA !== undefined || data.ratings.userB !== undefined;

  return (
    <div className="flex flex-col items-center justify-center gap-8 px-8 text-center">
      <motion.p
        className="text-xs uppercase tracking-[0.35em] text-zinc-500"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.1 }}
      >
        média de notas
      </motion.p>

      {isDuo ? (
        <DuoRatings data={data} active={active} />
      ) : (
        <SoloRating data={data} active={active} />
      )}
    </div>
  );
}

function DuoRatings({ data, active }: { data: RetroData; active: boolean }) {
  const users = [
    { label: 'ele', value: data.ratings.userA, color: 'text-violet-400' },
    { label: 'ela', value: data.ratings.userB, color: 'text-pink-400' },
  ];

  return (
    <div className="flex gap-12">
      {users.map((u, i) => (
        <motion.div
          key={u.label}
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
          transition={{ delay: 0.2 + i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className={`font-cormorant text-7xl font-light ${u.color}`}>
            {u.value != null ? u.value.toFixed(1) : '—'}
          </span>
          <span className="text-xs text-zinc-500">{u.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

function SoloRating({ data, active }: { data: RetroData; active: boolean }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
      transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="font-cormorant text-8xl font-light text-pink-400">
        {data.ratings.average != null ? data.ratings.average.toFixed(1) : '—'}
      </span>
      <span className="text-xs text-zinc-500">em 10 pontos</span>
    </motion.div>
  );
}
