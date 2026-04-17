'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getWatchItems } from '@/lib/api/watch-items';
import { WatchItemStatus, WatchItemTipo } from '@/types/watch-item';
import { WatchItemCard } from './watch-item-card';
import { Film } from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type WatchItemsListProps = {
  status?: WatchItemStatus;
  tipo?: WatchItemTipo | 'todos';
  direction?: number;
};

// ─── Variantes de slide direcional ───────────────────────────────────────────

const slideVariants = {
  // Entrada: vem da direita (dir>0) ou da esquerda (dir<0), fade simples se dir=0
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : dir < 0 ? '-100%' : 0,
    opacity: dir === 0 ? 0 : 1,
  }),
  // Spring no enter — flui naturalmente para o centro
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'spring' as const, stiffness: 360, damping: 36 },
      opacity: { duration: 0.22, ease: 'easeOut' as const },
    },
  },
  // Saída rápida com easeIn (parallax parcial)
  exit: (dir: number) => ({
    x: dir > 0 ? '-38%' : dir < 0 ? '38%' : 0,
    opacity: 0,
    transition: {
      x: { duration: 0.2, ease: [0.32, 0, 0.67, 0] as [number, number, number, number] },
      opacity: { duration: 0.15 },
    },
  }),
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
      <div className="w-[3px] flex-shrink-0 skeleton" />
      <div className="flex-shrink-0 p-3 pr-2">
        <div className="h-[90px] w-[60px] rounded-xl skeleton" />
      </div>
      <div className="flex flex-1 flex-col justify-between p-3">
        <div className="space-y-2">
          <div className="h-4 w-3/4 rounded-full skeleton" />
          <div className="h-3 w-1/3 rounded-full skeleton" />
        </div>
        <div className="flex gap-2">
          <div className="h-3 w-16 rounded-full skeleton" />
          <div className="h-3 w-12 rounded-full skeleton" />
        </div>
      </div>
    </div>
  );
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function WatchItemsList({ status, tipo = 'todos', direction = 0 }: WatchItemsListProps) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['watch-items', status, tipo],
    queryFn: () =>
      getWatchItems({
        page: 1,
        limit: 50,
        status,
        tipo: tipo === 'todos' ? undefined : tipo,
        sortBy: 'createdAt',
      }),
  });

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="grid gap-3 md:grid-cols-2 md:gap-4"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </motion.div>
    );
  }

  if (isError) {
    return <p className="text-sm text-red-400">Erro: {error.message}</p>;
  }

  if (!data?.data.length) {
    return (
      <AnimatePresence custom={direction} mode="popLayout">
        <motion.div
          key={`empty-${status}-${tipo}`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="flex flex-col items-center gap-3 py-14 text-center"
          style={{ willChange: 'transform, opacity' }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 ring-1 ring-zinc-800">
            <Film size={20} className="text-zinc-600" />
          </div>
          <p className="text-sm text-zinc-600">Nenhum item encontrado.</p>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence custom={direction} mode="popLayout">
      <motion.div
        key={`${status}-${tipo}`}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        className="grid gap-3 md:grid-cols-2 md:gap-4"
        style={{ willChange: 'transform, opacity' }}
      >
        {data.data.map((item, index) => (
          <WatchItemCard key={item.id} item={item} index={index} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
