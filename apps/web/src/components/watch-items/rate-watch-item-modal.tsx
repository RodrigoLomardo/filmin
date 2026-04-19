'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Film, Tv, BookOpen, Star, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WatchItem } from '@/types/watch-item';
import { rateWatchItem } from '@/lib/api/watch-items';
import { useAchievementCheck } from '@/lib/achievement-context';

// ─── Config ───────────────────────────────────────────────────────────────────

const TIPO_ICON = { filme: Film, serie: Tv, livro: BookOpen };

// ─── Component ────────────────────────────────────────────────────────────────

type Props = { item: WatchItem | null; onClose: () => void };

export function RateWatchItemModal({ item, onClose }: Props) {
  const [nota, setNota] = useState('');
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const triggerAchievementCheck = useAchievementCheck();

  const Icon = item ? (TIPO_ICON[item.tipo] ?? Film) : Film;

  const { mutate, isPending } = useMutation({
    mutationFn: (value: number) => rateWatchItem(item!.id, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watch-items'] });
      void triggerAchievementCheck();
      onClose();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  function handleSubmit() {
    setError(null);
    const value = parseFloat(nota.replace(',', '.'));
    if (isNaN(value) || value < 0 || value > 10) {
      setError('Informe uma nota entre 0 e 10.');
      return;
    }
    mutate(value);
  }

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
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col overflow-hidden rounded-t-[28px] bg-[#0b0b0d]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280, mass: 0.85 }}
          >
            {/* Handle */}
            <div className="flex flex-shrink-0 justify-center pt-3 pb-1">
              <div className="h-[3px] w-9 rounded-full bg-zinc-700/80" />
            </div>

            {/* ── Header ── */}
            <div className="relative mx-4 mb-4 flex-shrink-0 h-[120px] overflow-hidden rounded-2xl">
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
                    <Icon size={64} />
                  </div>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="mb-1 flex items-center gap-1.5">
                  <Icon size={10} className="text-pink-400" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-pink-400">
                    Sua avaliação
                  </span>
                </div>
                <h2 className="line-clamp-1 text-base font-bold leading-tight text-white">
                  {item.titulo}
                </h2>
              </div>

              <button
                onClick={onClose}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-zinc-300 backdrop-blur-sm transition hover:bg-black/70"
              >
                <X size={14} />
              </button>
            </div>

            {/* ── Input ── */}
            <div className="px-4 pb-2">
              <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                <Star size={11} className="text-pink-500" />
                Sua nota (0 – 10)
              </label>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={10}
                step={0.1}
                value={nota}
                onChange={(e) => { setNota(e.target.value); setError(null); }}
                placeholder="ex: 8.5"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-pink-500/60 focus:ring-1 focus:ring-pink-500/30"
              />
              {error && (
                <p className="mt-1.5 text-[11px] text-red-400">{error}</p>
              )}
            </div>

            {/* ── Submit ── */}
            <div
              className="flex-shrink-0 px-4 pt-3"
              style={{
                background: 'linear-gradient(to top, #0b0b0d 75%, transparent)',
                paddingBottom: 'max(1.75rem, env(safe-area-inset-bottom))',
              }}
            >
              <motion.button
                onClick={handleSubmit}
                disabled={isPending || nota === ''}
                whileTap={!isPending ? { scale: 0.975 } : {}}
                className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-pink-500 py-4 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 disabled:opacity-60"
              >
                <AnimatePresence mode="wait">
                  {isPending ? (
                    <motion.span
                      key="loading"
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
                      <Star size={14} />
                      Confirmar avaliação
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
