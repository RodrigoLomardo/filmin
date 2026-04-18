'use client';

import { useRef, useState } from 'react';
import { WatchItemsList } from './watch-item-list';
import { WatchItemsTabs } from './watch-items.tabs';
import { WatchItemsTypeFilter } from './watch-items-type-filter';
import { GallerySelector } from './gallery-selector';
import { useGroup } from '@/lib/hooks/use-group';
import { WatchItemStatus, WatchItemTipo } from '@/types/watch-item';

type GalleryType = 'duo' | 'solo';

const STATUS_TABS: WatchItemStatus[] = [
  'assistido',
  'assistindo',
  'quero_assistir',
  'abandonado',
];

export function WatchItemsDashboard() {
  const { hasSoloGallery } = useGroup();

  const [gallery, setGallery] = useState<GalleryType>('duo');
  const [statusIndex, setStatusIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [tipo, setTipo] = useState<WatchItemTipo | 'todos'>('todos');

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swipeLocked = useRef(false);

  const status = STATUS_TABS[statusIndex];

  function handleGalleryChange(next: GalleryType) {
    setGallery(next);
    setStatusIndex(0);
    setDirection(0);
    setTipo('todos');
  }

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

    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;

    if (dx > 0) changeStatusIndex(statusIndex - 1);
    else changeStatusIndex(statusIndex + 1);
  }

  return (
    <section className="flex flex-col gap-3">
      {hasSoloGallery && (
        <GallerySelector value={gallery} onChange={handleGalleryChange} />
      )}

      <WatchItemsTabs value={status} onChange={handleTabChange} />
      <WatchItemsTypeFilter value={tipo} onChange={setTipo} />

      <div
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <WatchItemsList
          status={status}
          tipo={tipo}
          direction={direction}
          gallery={gallery}
        />
      </div>
    </section>
  );
}
