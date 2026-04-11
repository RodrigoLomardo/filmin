'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Clock, Film, Tv, BookOpen, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WatchItem } from '@/types/watch-item';
import { rateWatchItem } from '@/lib/api/watch-items';

// ─── Config ───────────────────────────────────────────────────────────────────

const TIPO_ICON: Record<string, React.ElementType> = {
  filme: Film,
  serie: Tv,
  livro: BookOpen,
};

const SESSION_KEY = 'pending_rating_dismissed';

// ─── Animated counter — partner note reveal ───────────────────────────────────

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Number(value);
    const duration = 900;
    const start = performance.now();

    function frame(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(eased * target);
      if (progress < 1) requestAnimationFrame(frame);
      else setDisplay(target);
    }

    const raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{display.toFixed(1)}</>;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

type ModalProps = {
  items: WatchItem[];
  open: boolean;
  onClose: () => void;
  onDismiss: () => void;
};

export function PendingRatingNotificationModal({
  items,
  open,
  onClose,
  onDismiss,
}: ModalProps) {
  const [index, setIndex] = useState(0);
  const [nota, setNota] = useState('');
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Reset when items or open state changes
  useEffect(() => {
    if (open) {
      setIndex(0);
      setNota('');
      setError(null);
    }
  }, [open, items]);

  const currentItem = items[index];

  const { mutate, isPending } = useMutation({
    mutationFn: (value: number) => rateWatchItem(currentItem.id, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watch-items'] });
      if (index < items.length - 1) {
        setIndex((i) => i + 1);
        setNota('');
        setError(null);
      } else {
        onClose();
      }
    },
    onError: (err: Error) => setError(err.message),
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

  if (!open || !currentItem) return null;

  const Icon = TIPO_ICON[currentItem.tipo] ?? Film;
  const partnerNota =
    currentItem.firstRatingField === 'dele'
      ? currentItem.notaDele
      : currentItem.notaDela;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onDismiss}
          />

          {/* ── Modal ── */}
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center px-5">
            <motion.div
              className="pointer-events-auto w-full max-w-[360px] overflow-hidden rounded-3xl border border-zinc-800/70 bg-[#0e0e11] shadow-2xl"
              initial={{ scale: 0.86, y: -24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 12, opacity: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 300, mass: 0.9 }}
            >
              {/* Item content — slides on index change */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentItem.id}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                >
                  {/* ── Poster area ── */}
                  <div className="relative h-[196px] overflow-hidden">
                    {currentItem.posterUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={currentItem.posterUrl}
                          alt=""
                          className="absolute inset-0 h-full w-full scale-110 object-cover blur-lg"
                          style={{ opacity: 0.55 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-[#0e0e11]" />

                        {/* Sharp poster thumb */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                          <motion.div
                            className="h-[108px] w-[72px] overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/15"
                            initial={{ y: 14, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.38 }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={currentItem.posterUrl}
                              alt={currentItem.titulo}
                              className="h-full w-full object-cover"
                            />
                          </motion.div>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-b from-zinc-900/80 to-[#0e0e11] pb-4">
                        <div className="flex h-[108px] w-[72px] items-center justify-center rounded-xl bg-zinc-800/80 ring-1 ring-zinc-700/50">
                          <Icon size={32} className="text-zinc-600" />
                        </div>
                      </div>
                    )}

                    {/* Top bar */}
                    <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-4">
                      <motion.div
                        className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18 }}
                      >
                        <motion.div
                          animate={{ opacity: [1, 0.35, 1] }}
                          transition={{ duration: 1.8, repeat: Infinity }}
                        >
                          <Clock size={9} className="text-amber-400" />
                        </motion.div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                          Avaliação pendente
                          {items.length > 1 && (
                            <span className="ml-1 opacity-60">
                              · {index + 1}/{items.length}
                            </span>
                          )}
                        </span>
                      </motion.div>

                      <button
                        onClick={onDismiss}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-zinc-400 backdrop-blur-sm transition hover:text-zinc-200"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>

                  {/* ── Body ── */}
                  <div className="px-5 pb-5 pt-3">
                    {/* Title */}
                    <motion.div
                      className="mb-4"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 }}
                    >
                      <h2 className="line-clamp-2 text-[19px] font-bold leading-tight text-white">
                        {currentItem.titulo}
                      </h2>
                      <p className="mt-0.5 text-xs capitalize text-zinc-500">
                        {currentItem.tipo} · {currentItem.anoLancamento}
                      </p>
                    </motion.div>

                    {/* Partner's note */}
                    {partnerNota != null && (
                      <motion.div
                        className="mb-4 flex items-center gap-3 rounded-2xl border border-zinc-800/60 bg-zinc-900/50 p-3"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-pink-500/25 bg-pink-500/10">
                          <Star
                            size={14}
                            className="text-pink-400"
                            fill="currentColor"
                          />
                        </div>
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-500">
                            Nota do parceiro
                          </p>
                          <p className="text-xl font-bold tabular-nums leading-tight text-pink-400">
                            <AnimatedCounter value={Number(partnerNota)} />
                            <span className="text-xs font-normal text-zinc-600">
                              /10
                            </span>
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Input */}
                    <motion.div
                      className="mb-4"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.26 }}
                    >
                      <label className="mb-2 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-widest text-zinc-500">
                        <Star size={9} className="text-pink-500" />
                        Sua nota (0 – 10)
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        max={10}
                        step={0.1}
                        value={nota}
                        onChange={(e) => {
                          setNota(e.target.value);
                          setError(null);
                        }}
                        placeholder="ex: 8.5"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-white placeholder-zinc-700 outline-none transition focus:border-pink-500/50 focus:bg-zinc-900 focus:ring-1 focus:ring-pink-500/25"
                        autoFocus
                      />
                      <AnimatePresence>
                        {error && (
                          <motion.p
                            className="mt-1.5 text-[11px] text-red-400"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            {error}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Actions */}
                    <motion.div
                      className="flex flex-col gap-2"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.32 }}
                    >
                      <motion.button
                        onClick={handleSubmit}
                        disabled={isPending || nota === ''}
                        whileTap={!isPending ? { scale: 0.975 } : {}}
                        className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-pink-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition disabled:opacity-50"
                      >
                        <AnimatePresence mode="wait">
                          {isPending ? (
                            <motion.span
                              key="loading"
                              className="flex items-center gap-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <Loader2 size={15} className="animate-spin" />
                              Salvando...
                            </motion.span>
                          ) : (
                            <motion.span
                              key="idle"
                              className="flex items-center gap-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <Star size={14} fill="currentColor" />
                              Avaliar agora
                            </motion.span>
                          )}
                        </AnimatePresence>

                        {/* Shimmer */}
                        {!isPending && (
                          <motion.div
                            className="pointer-events-none absolute inset-0"
                            animate={{ backgroundPositionX: ['-200%', '300%'] }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              repeatDelay: 2.5,
                              ease: 'easeInOut',
                            }}
                            style={{
                              background:
                                'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.12) 53%, transparent 68%)',
                              backgroundSize: '200% 100%',
                            }}
                          />
                        )}
                      </motion.button>

                      <button
                        onClick={onDismiss}
                        className="py-2 text-sm text-zinc-600 transition hover:text-zinc-400"
                      >
                        Avaliar depois
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Notification Bell Button ─────────────────────────────────────────────────

type BellProps = { count: number; onClick: () => void };

export function PendingNotificationButton({ count, onClick }: BellProps) {
  if (count === 0) return null;

  return (
    <motion.button
      onClick={onClick}
      aria-label={`${count} avaliação${count > 1 ? 'ões' : ''} pendente${count > 1 ? 's' : ''}`}
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 transition hover:bg-amber-500/20 active:scale-90"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 14, stiffness: 320 }}
      whileTap={{ scale: 0.88 }}
    >
      {/* Pulsing outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-amber-400/50"
        animate={{ scale: [1, 1.45], opacity: [0.55, 0] }}
        transition={{ duration: 1.9, repeat: Infinity, ease: 'easeOut' }}
      />

      <span className="text-[13px] font-bold leading-none">!</span>

      {/* Count badge */}
      {count > 1 && (
        <motion.span
          className="absolute -right-1 -top-1 flex h-[17px] w-[17px] items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-black"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 300 }}
        >
          {count}
        </motion.span>
      )}
    </motion.button>
  );
}

// ─── Session storage helpers ──────────────────────────────────────────────────

export function markPendingDismissed() {
  sessionStorage.setItem(SESSION_KEY, '1');
}

export function clearPendingDismissed() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function isPendingDismissed() {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}
