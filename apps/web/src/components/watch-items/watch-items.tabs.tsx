'use client';

import { motion } from 'framer-motion';
import { WatchItemStatus } from '@/types/watch-item';
import { cn } from '@/lib/utils';

type WatchItemsTabsProps = {
  value: WatchItemStatus;
  onChange: (value: WatchItemStatus) => void;
};

const tabs: { label: string; value: WatchItemStatus }[] = [
  { label: 'Assistidos', value: 'assistido' },
  { label: 'Assistindo', value: 'assistindo' },
  { label: 'Quero assistir', value: 'quero_assistir' },
  { label: 'Abandonados', value: 'abandonado' },
];

export function WatchItemsTabs({ value, onChange }: WatchItemsTabsProps) {
  return (
    <motion.div
      className="flex gap-2 overflow-x-auto scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
            className={cn(
              'whitespace-nowrap rounded-full px-4 py-2 text-sm transition',
              active
                ? 'bg-pink-500 text-white'
                : 'text-zinc-400',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </motion.div>
  );
}