'use client';

import { motion } from 'framer-motion';
import { Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type GalleryType = 'duo' | 'solo';

type GallerySelectorProps = {
  value: GalleryType;
  onChange: (value: GalleryType) => void;
};

const options: { label: string; value: GalleryType; icon: typeof Heart }[] = [
  { label: 'Compartilhado', value: 'duo', icon: Heart },
  { label: 'Meu', value: 'solo', icon: User },
];

export function GallerySelector({ value, onChange }: GallerySelectorProps) {
  return (
    <motion.div
      className="flex w-full gap-1 rounded-2xl bg-zinc-900/80 p-1"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        const Icon = opt.icon;

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium"
          >
            {active && (
              <motion.span
                layoutId="gallery-tab-indicator"
                className="absolute inset-0 rounded-xl bg-pink-500 shadow-[0_0_14px_rgba(255,46,166,0.45)]"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            <span className={cn('relative z-10 flex items-center gap-1.5 transition-colors duration-200', active ? 'text-white' : 'text-zinc-500')}>
              <Icon size={13} className={cn(active && opt.value === 'duo' ? 'fill-white/30' : '')} />
              {opt.label}
              {opt.value === 'solo' && active && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest"
                >
                  Solo
                </motion.span>
              )}
            </span>
          </button>
        );
      })}
    </motion.div>
  );
}
