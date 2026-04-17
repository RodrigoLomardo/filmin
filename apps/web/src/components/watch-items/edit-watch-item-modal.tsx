'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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

  return createPortal(
    <AnimatePresence>
      {item && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* ── Bottom sheet ── */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col overflow-hidden"
            style={{
              maxHeight: '92dvh',
              borderRadius: '28px 28px 0 0',
              background: 'linear-gradient(180deg, #121214 0%, #0b0b0d 100%)',
              boxShadow: '0 -1px 0 rgba(255,255,255,0.05), 0 -32px 80px rgba(0,0,0,0.95)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 300, mass: 0.85 }}
          >
            {/* Handle */}
            <div className="flex flex-shrink-0 justify-center pt-3.5 pb-1">
              <div
                className="rounded-full"
                style={{ width: 38, height: 4, background: 'rgba(255,255,255,0.13)' }}
              />
            </div>

            {/* ── Hero ── */}
            <div
              className="relative mx-4 mb-4 flex-shrink-0 overflow-hidden"
              style={{ height: 140, borderRadius: 22 }}
            >
              {/* Background blur */}
              {item.posterUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.posterUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ transform: 'scale(1.25)', filter: 'blur(18px)', opacity: 0.65 }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(120deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 100%)' }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }}
                  />
                </>
              ) : (
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1c1c20 0%, #0f0f12 100%)' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon size={72} style={{ color: 'rgba(255,255,255,0.04)' }} />
                  </div>
                  <div
                    className="absolute inset-0"
                    style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(236,72,153,0.07) 0%, transparent 60%)' }}
                  />
                </div>
              )}

              {/* Content */}
              <div className="absolute inset-0 flex items-end gap-3 p-4">
                {/* Poster thumbnail */}
                <div
                  className="flex-shrink-0 overflow-hidden"
                  style={{
                    width: 52,
                    height: 76,
                    borderRadius: 11,
                    boxShadow: '0 6px 20px rgba(0,0,0,0.65)',
                    background: 'rgba(255,255,255,0.05)',
                  }}
                >
                  {item.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.posterUrl} alt={item.titulo} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Icon size={18} style={{ color: 'rgba(255,255,255,0.2)' }} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1 pb-0.5">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <Icon size={9} className="flex-shrink-0 text-pink-400" />
                    <span
                      className="text-[9px] font-bold uppercase tracking-[0.22em] text-pink-400"
                    >
                      {tipoLabel}{item.anoLancamento ? ` · ${item.anoLancamento}` : ''}
                    </span>
                  </div>
                  <h2 className="line-clamp-2 text-[15px] font-bold leading-snug text-white">
                    {item.titulo}
                  </h2>
                  {item.tituloOriginal && item.tituloOriginal !== item.titulo && (
                    <p
                      className="mt-0.5 truncate text-[11px]"
                      style={{ color: 'rgba(255,255,255,0.32)' }}
                    >
                      {item.tituloOriginal}
                    </p>
                  )}
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-3 top-3 flex items-center justify-center transition-opacity hover:opacity-80"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(8px)',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                <X size={13} />
              </button>
            </div>

            {/* ── Scrollable form ── */}
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
              className="flex-shrink-0 px-4 pt-4"
              style={{
                background: 'linear-gradient(to top, #0b0b0d 65%, transparent)',
                paddingBottom: 'max(1.75rem, env(safe-area-inset-bottom))',
              }}
            >
              <motion.button
                type="submit"
                form="edit-item-form"
                disabled={isPending}
                whileTap={!isPending ? { scale: 0.975 } : {}}
                className="relative w-full overflow-hidden py-[15px] text-[15px] font-semibold text-white disabled:opacity-60"
                style={{
                  borderRadius: 18,
                  background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                  boxShadow: isPending ? 'none' : '0 4px 28px rgba(236,72,153,0.28)',
                }}
              >
                <AnimatePresence mode="wait">
                  {isPending ? (
                    <motion.span
                      key="pending"
                      className="flex items-center justify-center gap-2"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.14 }}
                    >
                      <Loader2 size={15} className="animate-spin" />
                      Salvando...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      className="flex items-center justify-center gap-2"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.14 }}
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
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' as const }}
                    style={{
                      background: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.13) 53%, transparent 68%)',
                      backgroundSize: '200% 100%',
                    }}
                  />
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
