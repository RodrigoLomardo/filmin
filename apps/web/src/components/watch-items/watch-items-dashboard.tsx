'use client';

import { useState } from 'react';
import { WatchItemsList } from './watch-item-list';
import { WatchItemsTabs } from './watch-items.tabs';
import { WatchItemsTypeFilter } from './watch-items-type-filter';
import { WatchItemStatus, WatchItemTipo } from '@/types/watch-item';

export function WatchItemsDashboard() {
  const [status, setStatus] = useState<WatchItemStatus>('assistido');
  const [tipo, setTipo] = useState<WatchItemTipo | 'todos'>('todos');

  return (
    <section className="space-y-4">
      <WatchItemsTabs value={status} onChange={setStatus} />
      <WatchItemsTypeFilter value={tipo} onChange={setTipo} />
      <WatchItemsList status={status} tipo={tipo} />
    </section>
  );
}