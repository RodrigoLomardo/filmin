'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { RetroData } from '@/types/stats';

interface PosterCardProps {
  item: RetroData['highlights']['best'];
  label: string;
  labelColor: string;
  active: boolean;
  delay: number;
}

export function PosterCard({ item, label, labelColor, active, delay }: PosterCardProps) {
  if (!item) return null;

  const typeIcon = item.tipo === 'filme' ? '🎬' : item.tipo === 'serie' ? '📺' : '📚';

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative h-28 w-20 overflow-hidden rounded-lg ring-1 ring-white/10">
        {item.posterUrl ? (
          <Image src={item.posterUrl} alt={item.titulo} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-2xl">
            {typeIcon}
          </div>
        )}
      </div>

      <p className="max-w-[80px] text-center text-xs leading-tight text-zinc-300 line-clamp-2">
        {item.titulo}
      </p>

      <span className={`text-xs font-semibold ${labelColor}`}>
        {label} · {item.nota.toFixed(1)}
      </span>
    </motion.div>
  );
}
