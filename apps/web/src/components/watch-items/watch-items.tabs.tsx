'use client';

import { WatchItemStatus } from '@/types/watch-item';
import { cn } from '@/lib/utils';

type WatchItemsTabsProps = {
  value: WatchItemStatus;
  onChange: (value: WatchItemStatus) => void;
};

const tabs: { label: string; value: WatchItemStatus }[] = [
  { label: 'Quero assistir', value: 'quero_assistir' },
  { label: 'Assistindo', value: 'assistindo' },
  { label: 'Assistidos', value: 'assistido' },
  { label: 'Abandonados', value: 'abandonado' },
];

export function WatchItemsTabs({ value, onChange }: WatchItemsTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {tabs.map((tab) => {
        const active = tab.value === value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'whitespace-nowrap rounded-full border px-4 py-2 text-sm transition',
              active
                ? 'border-pink-500 bg-pink-500 text-white'
                : 'border-zinc-700 bg-zinc-900 text-zinc-300',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}