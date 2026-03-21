'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getWatchItems } from '@/lib/api/watch-items';
import { WatchItemStatus, WatchItemTipo } from '@/types/watch-item';
import { WatchItemCard } from './watch-item-card';

type WatchItemsListProps = {
  status?: WatchItemStatus;
  tipo?: WatchItemTipo | 'todos';
};

export function WatchItemsList({ status, tipo = 'todos' }: WatchItemsListProps) {
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
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-zinc-400"
      >
        Carregando...
      </motion.p>
    );
  }

  if (isError) {
    return <p className="text-sm text-red-400">Erro: {error.message}</p>;
  }

  if (!data?.data.length) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-zinc-400"
      >
        Nenhum item encontrado.
      </motion.p>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${status}-${tipo}`}
        className="grid gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        {data.data.map((item, index) => (
          <WatchItemCard key={item.id} item={item} index={index} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}