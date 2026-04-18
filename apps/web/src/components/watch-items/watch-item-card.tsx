'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Film, Tv, BookOpen, Star, Clock } from 'lucide-react';
import { GalleryType, WatchItem } from '@/types/watch-item';
import { EditWatchItemModal } from './edit-watch-item-modal';
import { useGroupTipo } from '@/lib/hooks/use-group-tipo';
import { cn } from '@/lib/utils';

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_STRIP: Record<string, string> = {
  quero_assistir: 'bg-zinc-500',
  assistindo:     'bg-amber-400',
  assistido:      'bg-emerald-500',
  abandonado:     'bg-red-500',
};

const TIPO_PLACEHOLDER: Record<string, string> = {
  filme: 'bg-gradient-to-b from-pink-500/25 via-pink-500/5 to-transparent',
  serie: 'bg-gradient-to-b from-sky-500/25 via-sky-500/5 to-transparent',
  livro: 'bg-gradient-to-b from-amber-500/25 via-amber-500/5 to-transparent',
};

const TIPO_ICON = { filme: Film, serie: Tv, livro: BookOpen };

// ─── Component ────────────────────────────────────────────────────────────────

type Props = { item: WatchItem; index: number; gallery?: GalleryType };

export function WatchItemCard({ item, index, gallery }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const groupTipo = useGroupTipo();

  const Icon = TIPO_ICON[item.tipo] ?? Film;
  const isFilmeOuLivro = item.tipo === 'filme' || item.tipo === 'livro';
  const isSoloView = gallery === 'solo';

  // Solo: exibe notaDele (ou notaDela se for o único campo preenchido) ou notaGeral
  // Duo: exibe notaGeral
  const rating = isFilmeOuLivro
    ? isSoloView
      ? (item.notaDele ?? item.notaDela ?? item.notaGeral)
      : groupTipo === 'duo'
        ? item.notaGeral
        : item.notaDele
    : item.notaGeral;

  // Oculta badge de "Aguardando parceiro" na galeria solo
  const showAwaitingBadge = !isSoloView && item.ratingStatus === 'awaiting_partner';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: index * 0.045, ease: [0.23, 1, 0.32, 1] }}
        whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
        onClick={() => setEditOpen(true)}
        className="cursor-pointer select-none"
      >
        <div className="flex overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition-all duration-200 hover:border-zinc-700 hover:shadow-[0_4px_24px_rgba(255,46,166,0.07)]">

          {/* Status strip */}
          <div className={cn('w-[3px] flex-shrink-0', STATUS_STRIP[item.status] ?? 'bg-zinc-500')} />

          {/* Poster */}
          <div className="flex-shrink-0 p-3 pr-2">
            {item.posterUrl ? (
              <div className="h-[90px] w-[60px] overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.posterUrl}
                  alt={item.titulo}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div
                className={cn(
                  'flex h-[90px] w-[60px] items-center justify-center rounded-xl',
                  TIPO_PLACEHOLDER[item.tipo] ?? 'bg-zinc-900/80',
                )}
              >
                <Icon size={20} className="text-zinc-500" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col justify-between py-3 pr-3">

            {/* Top row */}
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-snug text-white">
                  {item.titulo}
                </p>
                <p className="mt-0.5 text-[11px] capitalize text-zinc-500">
                  {item.tipo} · {item.anoLancamento}
                </p>
              </div>
              {rating != null && (
                <div className="mt-0.5 flex flex-shrink-0 items-center gap-1 rounded-full bg-zinc-900 px-2 py-1 ring-1 ring-white/5">
                  <Star size={9} className="text-pink-500" fill="currentColor" />
                  <span className="text-[11px] font-bold tabular-nums text-white">{rating}</span>
                </div>
              )}
            </div>

            {/* Bottom row */}
            <div className="flex items-center gap-1.5">
              {showAwaitingBadge ? (
                <div className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5">
                  <Clock size={9} className="text-amber-400" />
                  <span className="text-[10px] font-medium text-amber-400">
                    Aguardando parceiro
                  </span>
                </div>
              ) : item.generos.length > 0 ? (
                <>
                  {item.generos.slice(0, 2).map((g) => (
                    <span
                      key={g.id}
                      className="truncate rounded-full border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-600"
                    >
                      {g.nome}
                    </span>
                  ))}
                  {item.generos.length > 2 && (
                    <span className="text-[10px] text-zinc-700">
                      +{item.generos.length - 2}
                    </span>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </motion.div>

      <EditWatchItemModal
        item={editOpen ? item : null}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}
