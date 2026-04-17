'use client';

import { motion } from 'framer-motion';

interface SlideProgressBarProps {
  current: number;
  total: number;
  onClose: () => void;
}

export function SlideProgressBar({ current, total, onClose }: SlideProgressBarProps) {
  return (
    <div className="relative z-10 flex items-center justify-between px-4 pt-6">
      <button
        className="p-1 text-zinc-600 transition-colors hover:text-zinc-400"
        onClick={onClose}
        aria-label="Fechar"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M15 5L5 15M5 5l10 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <motion.div
            key={i}
            className="h-1 rounded-full"
            animate={{
              width: i === current ? 20 : 6,
              backgroundColor: i === current ? '#ec4899' : '#3f3f46',
            }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          />
        ))}
      </div>

      <div className="w-7" />
    </div>
  );
}
