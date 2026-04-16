'use client';

import { motion } from 'framer-motion';
import { WatchItemStatus } from '@/types/watch-item';
import { cn } from '@/lib/utils';

type WatchItemsTabsProps = {
  value: WatchItemStatus;
  onChange: (value: WatchItemStatus) => void;
};

const tabs: { label: string; value: WatchItemStatus }[] = [
  { label: 'Vistos', value: 'assistido' },
  { label: 'Vendo', value: 'assistindo' },
  { label: 'Quero ver', value: 'quero_assistir' },
  { label: 'Drops', value: 'abandonado' },
];

export function WatchItemsTabs({ value, onChange }: WatchItemsTabsProps) {
  return (
    <motion.div
      className="flex w-full gap-1 rounded-2xl bg-zinc-900/80 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className="relative min-w-[68px] flex-1 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium"
          >
            {active && (
              <motion.span
                layoutId="status-tab-indicator"
                className="absolute inset-0 rounded-xl bg-pink-500 shadow-[0_0_14px_rgba(255,46,166,0.45)]"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            <span
              className={cn(
                'relative z-10 transition-colors duration-200',
                active ? 'text-white' : 'text-zinc-500',
              )}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </motion.div>
  );
}
