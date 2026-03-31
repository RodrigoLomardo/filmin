'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Heart, X, Film } from 'lucide-react';
import { getMatchPool } from '@/lib/api/watch-items';
import type { WatchItem } from '@/types/watch-item';

type Vote = boolean | null;

export default function MatchPage() {
  const { data: pool = [], isLoading, isError } = useQuery({
    queryKey: ['match-pool'],
    queryFn: getMatchPool,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [votoEle, setVotoEle] = useState<Vote>(null);
  const [votoEla, setVotoEla] = useState<Vote>(null);
  const [matchesDaSessao, setMatchesDaSessao] = useState<WatchItem[]>([]);

  const currentItem = pool[currentIndex];
  const isFinished = pool.length > 0 && currentIndex >= pool.length;

  useEffect(() => {
    if (votoEle === null || votoEla === null) return;

    if (votoEle && votoEla && currentItem) {
      setMatchesDaSessao((prev) => [...prev, currentItem]);
    }

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setVotoEle(null);
      setVotoEla(null);
    }, 650);

    return () => clearTimeout(timer);
  }, [votoEle, votoEla, currentItem]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <motion.div
          className="h-8 w-8 rounded-full border-2 border-pink-500 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center">
        <p className="text-sm text-white/60">Erro ao carregar os itens.</p>
        <Link href="/" className="text-sm text-pink-500 underline">
          Voltar ao início
        </Link>
      </div>
    );
  }

  if (pool.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-pink-500">Modo Match</p>
        <p className="text-sm text-white/60">Nenhum item na lista &quot;Quero Assistir&quot;.</p>
        <Link
          href="/cadastro"
          className="mt-2 rounded-full bg-pink-500 px-6 py-2.5 text-sm font-semibold text-white"
        >
          Adicionar itens
        </Link>
      </div>
    );
  }

  if (isFinished) {
    return (
      <ResultScreen
        matches={matchesDaSessao}
        onRestart={() => {
          setCurrentIndex(0);
          setMatchesDaSessao([]);
        }}
      />
    );
  }

  const isMatch = votoEle === true && votoEla === true;

  return (
    <div className="relative h-screen overflow-hidden bg-black select-none">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft size={18} />
          <span className="text-xs">Voltar</span>
        </Link>
        <p className="text-[10px] uppercase tracking-[0.2em] text-pink-500">Modo Match</p>
        <p className="text-xs text-white/30">
          {currentIndex + 1}/{pool.length}
        </p>
      </div>

      {/* Left half — Ele */}
      <div className="absolute top-0 left-0 h-full w-1/2">
        <AnimatePresence>
          {votoEle !== null && (
            <motion.div
              key={`overlay-ele-${currentIndex}`}
              className={`absolute inset-0 ${votoEle ? 'bg-green-500' : 'bg-red-500'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.18 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        <div className="absolute top-16 left-0 right-0 text-center">
          <p className="text-[10px] uppercase tracking-widest text-white/25">Ele</p>
        </div>

        <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-3">
          <VoteButton
            variant="no"
            active={votoEle === false}
            disabled={votoEle !== null}
            onClick={() => setVotoEle(false)}
          />
          <VoteButton
            variant="yes"
            active={votoEle === true}
            disabled={votoEle !== null}
            onClick={() => setVotoEle(true)}
          />
        </div>
      </div>

      {/* Right half — Ela */}
      <div className="absolute top-0 right-0 h-full w-1/2">
        <AnimatePresence>
          {votoEla !== null && (
            <motion.div
              key={`overlay-ela-${currentIndex}`}
              className={`absolute inset-0 ${votoEla ? 'bg-green-500' : 'bg-red-500'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.18 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        <div className="absolute top-16 left-0 right-0 text-center">
          <p className="text-[10px] uppercase tracking-widest text-white/25">Ela</p>
        </div>

        <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-3">
          <VoteButton
            variant="no"
            active={votoEla === false}
            disabled={votoEla !== null}
            onClick={() => setVotoEla(false)}
          />
          <VoteButton
            variant="yes"
            active={votoEla === true}
            disabled={votoEla !== null}
            onClick={() => setVotoEla(true)}
          />
        </div>
      </div>

      {/* Center divider */}
      <div className="absolute top-0 bottom-0 left-1/2 z-20 w-px -translate-x-1/2 bg-white/10" />

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          className="absolute top-1/2 left-1/2 z-20 w-44 -translate-x-1/2 -translate-y-[55%]"
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: -24 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* Poster */}
          <div
            className={`relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl transition-all duration-300 ${
              isMatch ? 'ring-2 ring-green-400' : 'ring-1 ring-white/10'
            }`}
          >
            {currentItem.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentItem.posterUrl}
                alt={currentItem.titulo}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Film size={40} className="text-white/15" />
              </div>
            )}

            {/* Match banner */}
            <AnimatePresence>
              {isMatch && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-black/40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="rounded-full bg-green-500 px-4 py-1.5">
                    <p className="text-xs font-bold uppercase tracking-widest text-white">
                      Match
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Info */}
          <div className="mt-2.5 text-center">
            <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">
              {currentItem.titulo}
            </p>
            <p className="mt-0.5 text-[11px] text-white/35">{currentItem.anoLancamento}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function VoteButton({
  variant,
  active,
  disabled,
  onClick,
}: {
  variant: 'yes' | 'no';
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const isYes = variant === 'yes';

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
        active
          ? isYes
            ? 'border-green-400 bg-green-500 text-white'
            : 'border-red-400 bg-red-500 text-white'
          : disabled
            ? 'cursor-not-allowed border-white/10 bg-white/5 text-white/20'
            : isYes
              ? 'border-white/20 bg-white/5 text-white/50 hover:border-green-400/50 hover:text-green-400'
              : 'border-white/20 bg-white/5 text-white/50 hover:border-red-400/50 hover:text-red-400'
      }`}
      whileTap={!disabled ? { scale: 0.85 } : {}}
      whileHover={!disabled && !active ? { scale: 1.08 } : {}}
    >
      {isYes ? <Heart size={18} /> : <X size={18} />}
    </motion.button>
  );
}

function ResultScreen({
  matches,
  onRestart,
}: {
  matches: WatchItem[];
  onRestart: () => void;
}) {
  return (
    <motion.div
      className="flex h-screen flex-col bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-6 pb-6 pt-14 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-pink-500">Modo Match</p>
        <h2 className="mt-2 text-3xl font-bold text-white">Resultado</h2>
        <p className="mt-1 text-sm text-white/40">
          {matches.length === 0
            ? 'Nenhum match desta sessão.'
            : `${matches.length} match${matches.length !== 1 ? 'es' : ''} nesta sessão`}
        </p>
      </div>

      {/* Matches list */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {matches.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-sm text-white/25">
              Vocês não concordaram em nenhum item.
              <br />
              Que tal tentar de novo?
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((item, i) => (
              <motion.div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
              >
                <div className="h-16 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                  {item.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.posterUrl}
                      alt={item.titulo}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Film size={20} className="text-white/20" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{item.titulo}</p>
                  <p className="text-xs text-white/40">{item.anoLancamento}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 space-y-3 px-6 pb-10">
        <motion.button
          onClick={onRestart}
          className="w-full rounded-full bg-pink-500 py-3.5 text-sm font-semibold text-white"
          whileTap={{ scale: 0.96 }}
        >
          Jogar novamente
        </motion.button>
        <Link
          href="/"
          className="block w-full rounded-full border border-white/15 py-3.5 text-center text-sm font-semibold text-white/50"
        >
          Início
        </Link>
      </div>
    </motion.div>
  );
}
