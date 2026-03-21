'use client';

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
        sortOrder: 'DESC',
      }),
  });

  if (isLoading) {
    return <p className="text-sm text-zinc-400">Carregando watch items...</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-red-400">
        Erro ao carregar watch items: {error.message}
      </p>
    );
  }

  if (!data?.data.length) {
    return <p className="text-sm text-zinc-400">Nenhum item encontrado.</p>;
  }

  return (
    <div className="grid gap-4">
      {data.data.map((item) => (
        <WatchItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}