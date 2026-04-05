'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Film, Tv, BookOpen, Check, Loader2 } from 'lucide-react';
import { WatchItem } from '@/types/watch-item';
import { EditWatchItemForm } from './edit-watch-item-form';

// ─── Config ───────────────────────────────────────────────────────────────────

const TIPO_ICON = { filme: Film, serie: Tv, livro: BookOpen };
const TIPO_LABEL = { filme: 'Filme', serie: 'Série', livro: 'Livro' };

// ─── Component ────────────────────────────────────────────────────────────────

type Props = { item: WatchItem | null; onClose: () => void };

export function EditWatchItemModal({ item, onClose }: Props) {
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    document.body.style.overflow = item ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [item]);

  const Icon = item ? (TIPO_ICON[item.tipo] ?? Film) : Film;
  const tipoLabel = item ? (TIPO_LABEL[item.tipo] ?? '') : '';

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* ── Bottom sheet ── */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[28px] bg-[#0b0b0d]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280, mass: 0.85 }}
          >
            {/* Handle */}
            <div className="flex flex-shrink-0 justify-center pt-3 pb-1">
              <div className="h-[3px] w-9 rounded-full bg-zinc-700/80" />
            </div>

            {/* ── Hero header ── */}
            <div className="relative mx-4 mb-4 flex-shrink-0 h-[140px] overflow-hidden rounded-2xl">
              {/* Poster blur bg or gradient */}
              {item.posterUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.posterUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full scale-110 object-cover blur-md"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950">
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.06]">
                    <Icon size={80} />
                  </div>
                </div>
              )}

              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="mb-1 flex items-center gap-1.5">
                  <Icon size={10} className="text-pink-400" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-pink-400">
                    {tipoLabel} · {item.anoLancamento}
                  </span>
                </div>
                <h2 className="line-clamp-2 text-base font-bold leading-tight text-white">
                  {item.titulo}
                </h2>
                {item.tituloOriginal && item.tituloOriginal !== item.titulo && (
                  <p className="mt-0.5 truncate text-[11px] text-zinc-400">
                    {item.tituloOriginal}
                  </p>
                )}
              </div>

              {/* Close */}
              <button
                onClick={onClose}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-zinc-300 backdrop-blur-sm transition hover:bg-black/70"
              >
                <X size={14} />
              </button>
            </div>

            {/* ── Scrollable form content ── */}
            <div
              className="min-h-0 flex-1 overflow-y-auto px-4 pb-2"
              style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              <EditWatchItemForm
                item={item}
                onSuccess={onClose}
                onPendingChange={setIsPending}
              />
            </div>

            {/* ── Sticky save footer ── */}
            <div
              className="flex-shrink-0 px-4 pt-3"
              style={{
                background: 'linear-gradient(to top, #0b0b0d 75%, transparent)',
                paddingBottom: 'max(1.75rem, env(safe-area-inset-bottom))',
              }}
            >
              <motion.button
                type="submit"
                form="edit-item-form"
                disabled={isPending}
                whileTap={!isPending ? { scale: 0.975 } : {}}
                className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-pink-500 py-4 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 disabled:opacity-60"
              >
                <AnimatePresence mode="wait">
                  {isPending ? (
                    <motion.span
                      key="pending"
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Loader2 size={15} className="animate-spin" />
                      Salvando...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Check size={15} />
                      Salvar alterações
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Shimmer */}
                {!isPending && (
                  <motion.div
                    className="pointer-events-none absolute inset-0"
                    animate={{ backgroundPositionX: ['-200%', '300%'] }}
                    transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }}
                    style={{
                      background: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.11) 53%, transparent 68%)',
                      backgroundSize: '200% 100%',
                    }}
                  />
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
