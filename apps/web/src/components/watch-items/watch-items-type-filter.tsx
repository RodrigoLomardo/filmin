'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { WatchItemTipo } from '@/types/watch-item';
import { Film, Tv, BookOpen, LayoutGrid } from 'lucide-react';
import type { ComponentType } from 'react';

type TipoFiltro = WatchItemTipo | 'todos';

type WatchItemsTypeFilterProps = {
  value: TipoFiltro;
  onChange: (value: TipoFiltro) => void;
};

const options: {
  label: string;
  value: TipoFiltro;
  Icon: ComponentType<{ size?: number; className?: string }>;
}[] = [
  { label: 'Todos', value: 'todos', Icon: LayoutGrid },
  { label: 'Filmes', value: 'filme', Icon: Film },
  { label: 'Séries', value: 'serie', Icon: Tv },
  { label: 'Livros', value: 'livro', Icon: BookOpen },
];

export function WatchItemsTypeFilter({ value, onChange }: WatchItemsTypeFilterProps) {
  return (
    <motion.div
      className="flex gap-1.5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15, ease: 'easeOut' }}
    >
      {options.map((option) => {
        const active = option.value === value;
        const Icon = option.Icon;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
              active
                ? 'bg-pink-500/12 text-pink-400 ring-1 ring-pink-500/25'
                : 'text-zinc-600 hover:text-zinc-400',
            )}
          >
            <Icon size={11} />
            {option.label}
          </button>
        );
      })}
    </motion.div>
  );
}
