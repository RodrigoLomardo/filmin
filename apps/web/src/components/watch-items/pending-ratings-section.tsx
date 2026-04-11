'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Film, Tv, BookOpen, Star } from 'lucide-react';
import { getPendingRatings } from '@/lib/api/watch-items';
import { WatchItem } from '@/types/watch-item';
import { RateWatchItemModal } from './rate-watch-item-modal';

// ─── Config ───────────────────────────────────────────────────────────────────

const TIPO_ICON = { filme: Film, serie: Tv, livro: BookOpen };

// ─── Component ────────────────────────────────────────────────────────────────

export function PendingRatingsSection() {
  const [selectedItem, setSelectedItem] = useState<WatchItem | null>(null);

  const { data: pending, isLoading } = useQuery({
    queryKey: ['watch-items', 'pending'],
    queryFn: getPendingRatings,
  });

  if (isLoading || !pending?.length) return null;

  return (
    <>
      <AnimatePresence>
        <motion.section
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          {/* Header */}
          <div className="flex items-center gap-2">
            <Star size={12} className="text-pink-500" fill="currentColor" />
            <h3 className="text-xs font-semibold uppercase tracking-widest text-pink-400">
              Pendentes para você
            </h3>
          </div>

          {/* Items */}
          <div className="grid gap-2">
            {pending.map((item, index) => {
              const Icon = TIPO_ICON[item.tipo] ?? Film;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.28, delay: index * 0.05 }}
                  className="flex items-center gap-3 rounded-2xl border border-pink-500/20 bg-pink-500/5 p-3"
                >
                  {/* Poster / icon */}
                  <div className="flex-shrink-0">
                    {item.posterUrl ? (
                      <div className="h-[52px] w-[35px] overflow-hidden rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.posterUrl}
                          alt={item.titulo}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-[52px] w-[35px] items-center justify-center rounded-lg bg-zinc-900/80">
                        <Icon size={14} className="text-zinc-600" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {item.titulo}
                    </p>
                    <p className="mt-0.5 text-[11px] capitalize text-zinc-500">
                      {item.tipo} · {item.anoLancamento}
                    </p>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="flex-shrink-0 rounded-xl bg-pink-500 px-3 py-1.5 text-[11px] font-semibold text-white transition active:scale-95"
                  >
                    Avaliar agora
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="h-px bg-zinc-800/60" />
        </motion.section>
      </AnimatePresence>

      <RateWatchItemModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}
