'use client';

import { useRef, useState } from 'react';
import { WatchItemsList } from './watch-item-list';
import { WatchItemsTabs } from './watch-items.tabs';
import { WatchItemsTypeFilter } from './watch-items-type-filter';
import { WatchItemStatus, WatchItemTipo } from '@/types/watch-item';

const STATUS_TABS: WatchItemStatus[] = [
  'assistido',
  'assistindo',
  'quero_assistir',
  'abandonado',
];

export function WatchItemsDashboard() {
  const [statusIndex, setStatusIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [tipo, setTipo] = useState<WatchItemTipo | 'todos'>('todos');

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swipeLocked = useRef(false);

  const status = STATUS_TABS[statusIndex];

  function changeStatusIndex(newIndex: number) {
    if (newIndex < 0 || newIndex >= STATUS_TABS.length) return;
    if (swipeLocked.current) return;
    swipeLocked.current = true;
    setTimeout(() => { swipeLocked.current = false; }, 380);
    setDirection(newIndex > statusIndex ? 1 : -1);
    setStatusIndex(newIndex);
  }

  function handleTabChange(newStatus: WatchItemStatus) {
    const newIndex = STATUS_TABS.indexOf(newStatus);
    if (newIndex !== -1) changeStatusIndex(newIndex);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;

    // Só dispara se o gesto for claramente horizontal
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;

    if (dx > 0) changeStatusIndex(statusIndex - 1); // swipe direita → anterior
    else changeStatusIndex(statusIndex + 1);         // swipe esquerda → próximo
  }

  return (
    <section className="flex flex-col gap-3">
      <WatchItemsTabs value={status} onChange={handleTabChange} />
      <WatchItemsTypeFilter value={tipo} onChange={setTipo} />

      {/* Área de swipe — overflow-hidden para clipar o slide */}
      <div
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <WatchItemsList status={status} tipo={tipo} direction={direction} />
      </div>
    </section>
  );
}
