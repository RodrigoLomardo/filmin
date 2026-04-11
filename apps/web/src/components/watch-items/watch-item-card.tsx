'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Film, Tv, BookOpen, Star, Clock } from 'lucide-react';
import { WatchItem } from '@/types/watch-item';
import { EditWatchItemModal } from './edit-watch-item-modal';
import { useGroupTipo } from '@/lib/hooks/use-group-tipo';

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  quero_assistir: { label: 'Quero ver',   className: 'text-zinc-400 bg-zinc-800/80' },
  assistindo:     { label: 'Assistindo',  className: 'text-amber-400 bg-amber-500/10' },
  assistido:      { label: 'Assistido',   className: 'text-emerald-400 bg-emerald-500/10' },
  abandonado:     { label: 'Abandonado',  className: 'text-red-400 bg-red-500/10' },
};

const TIPO_ICON = { filme: Film, serie: Tv, livro: BookOpen };

// ─── Component ────────────────────────────────────────────────────────────────

type Props = { item: WatchItem; index: number };

export function WatchItemCard({ item, index }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const groupTipo = useGroupTipo();

  const Icon = TIPO_ICON[item.tipo] ?? Film;
  const status = STATUS_STYLE[item.status] ?? STATUS_STYLE.quero_assistir;
  const isFilmeOuLivro = item.tipo === 'filme' || item.tipo === 'livro';

  const rating =
    isFilmeOuLivro
      ? groupTipo === 'duo' ? item.notaGeral : item.notaDele
      : item.notaGeral;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: index * 0.055, ease: [0.23, 1, 0.32, 1] }}
        whileTap={{ scale: 0.972, transition: { duration: 0.12 } }}
        onClick={() => setEditOpen(true)}
        className="cursor-pointer select-none"
      >
        <div className="flex gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 transition-colors duration-150 hover:border-zinc-700 active:bg-zinc-900/40">

          {/* ── Poster / icon ── */}
          <div className="flex-shrink-0">
            {item.posterUrl ? (
              <div className="h-[76px] w-[51px] overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.posterUrl}
                  alt={item.titulo}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-[76px] w-[51px] items-center justify-center rounded-xl bg-zinc-900/80">
                <Icon size={18} className="text-zinc-600" />
              </div>
            )}
          </div>

          {/* ── Content ── */}
          <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">

            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-snug text-white">
                  {item.titulo}
                </p>
                <p className="mt-0.5 text-[11px] capitalize text-zinc-500">
                  {item.tipo} · {item.anoLancamento}
                </p>
              </div>
              <span
                className={`mt-0.5 flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${status.className}`}
              >
                {status.label}
              </span>
            </div>

            {/* Bottom row */}
            <div className="flex items-center justify-between gap-2">
              {/* Genres or awaiting badge */}
              {item.ratingStatus === 'awaiting_partner' ? (
                <div className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5">
                  <Clock size={9} className="text-amber-400" />
                  <span className="text-[10px] font-medium text-amber-400">
                    Aguardando parceiro
                  </span>
                </div>
              ) : item.generos.length > 0 ? (
                <div className="flex min-w-0 gap-1 overflow-hidden">
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
                </div>
              ) : (
                <span />
              )}

              {/* Rating */}
              {rating != null && (
                <div className="flex flex-shrink-0 items-center gap-1">
                  <Star size={10} className="text-pink-500" fill="currentColor" />
                  <span className="text-xs font-semibold tabular-nums text-pink-400">
                    {rating}
                  </span>
                </div>
              )}
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
