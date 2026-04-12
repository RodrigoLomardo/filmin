'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { WatchItemTipo } from '@/types/watch-item';

type TipoFiltro = WatchItemTipo | 'todos';

type WatchItemsTypeFilterProps = {
  value: TipoFiltro;
  onChange: (value: TipoFiltro) => void;
};

const options: { label: string; value: TipoFiltro }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Filmes', value: 'filme' },
  { label: 'Séries', value: 'serie' },
  { label: 'Livros', value: 'livro' },
];

export function WatchItemsTypeFilter({ value, onChange }: WatchItemsTypeFilterProps) {
  return (
    <motion.div
      className="flex gap-2"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15, ease: 'easeOut' }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-full px-3 py-2 text-sm transition',
              active ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-300',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </motion.div>
  );
}