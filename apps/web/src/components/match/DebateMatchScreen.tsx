'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Swords } from 'lucide-react';
import { debateItems } from '@/lib/api/theo';
import type { WatchItem } from '@/types/watch-item';
import type { TheoDebateResponse } from '@/types/theo';
import { DebateSelector } from './debate/DebateSelector';
import { DebateArena } from './debate/DebateArena';
import { DebateArguments } from './debate/DebateArguments';
import { DebateVerdict } from './debate/DebateVerdict';

type DebatePhase = 'selecting' | 'loading' | 'result';

interface DebateMatchScreenProps {
  matches: WatchItem[];
  onBack: () => void;
}

// ── Loading screen ─────────────────────────────────────────────────────────────
function LoadingDebate({
  titleA,
  titleB,
}: {
  titleA: string;
  titleB: string;
}) {
  const steps = ['Analisando candidatos', 'Formulando argumentos', 'Preparando veredicto'];

  return (
    <motion.div
      className="flex h-dvh flex-col items-center justify-center gap-10 bg-[#050505] px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Animated orb */}
      <div className="relative flex h-20 w-20 items-center justify-center">
        {[40, 56, 72].map((size, i) => (
          <motion.div
            key={size}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              border: '1px solid rgba(255,46,166,0.2)',
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.4, 0.15] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.35 }}
          />
        ))}
        <span className="relative z-10 text-xl font-black text-white/80">T</span>
      </div>

      {/* vs row */}
      <div className="w-full">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1 text-right">
            <p className="truncate text-[12px] font-semibold text-[#ff2ea6]/80">{titleA}</p>
          </div>
          <div className="shrink-0">
            <Swords size={14} className="text-white/20" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-[12px] font-semibold text-[#8b5cf6]/80">{titleB}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-[1px] w-full overflow-hidden bg-white/5">
          <motion.div
            className="h-full"
            style={{ background: 'linear-gradient(90deg, #ff2ea6, #8b5cf6)' }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Stepping text */}
      <div className="flex flex-col items-center gap-2">
        {steps.map((step, i) => (
          <motion.p
            key={step}
            className="text-[10px] tracking-widest text-white/20"
            animate={{ opacity: [0.15, 0.6, 0.15] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }}
          >
            {step}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}

// ── Result view ────────────────────────────────────────────────────────────────
function ResultView({
  result,
  onReset,
  onBack,
}: {
  result: TheoDebateResponse;
  onReset: () => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      className="flex h-dvh flex-col bg-[#050505]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* Ambient gradient behind winner */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            result.winner === 'A'
              ? 'radial-gradient(ellipse 60% 35% at 20% 15%, rgba(255,46,166,0.07) 0%, transparent 70%)'
              : result.winner === 'B'
              ? 'radial-gradient(ellipse 60% 35% at 80% 15%, rgba(139,92,246,0.07) 0%, transparent 70%)'
              : 'radial-gradient(ellipse 80% 35% at 50% 10%, rgba(245,158,11,0.05) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <div className="relative z-10 shrink-0 flex items-center justify-between px-5 pt-12 pb-4">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-white/30 transition-colors active:text-white"
        >
          <ArrowLeft size={14} />
          <span className="text-[11px]">Novo debate</span>
        </button>
        <div className="text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#ff2ea6]">Debate</p>
        </div>
        <button
          onClick={onBack}
          className="text-[11px] text-white/20 transition-colors active:text-white"
        >
          Sair
        </button>
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        {/* Fighters */}
        <DebateArena
          itemA={result.itemA}
          itemB={result.itemB}
          winner={result.winner}
          revealed
        />

        {/* Arguments */}
        <DebateArguments
          argumentsForA={result.argumentsForA}
          argumentsForB={result.argumentsForB}
        />

        {/* Verdict */}
        <DebateVerdict result={result} />
      </div>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function DebateMatchScreen({ matches, onBack }: DebateMatchScreenProps) {
  const [phase, setPhase] = useState<DebatePhase>('selecting');
  const [selectedIds, setSelectedIds] = useState<[string | null, string | null]>([null, null]);
  const [result, setResult] = useState<TheoDebateResponse | null>(null);

  const [pendingA, setPendingA] = useState<WatchItem | null>(null);
  const [pendingB, setPendingB] = useState<WatchItem | null>(null);

  const { mutate: runDebate } = useMutation({
    mutationFn: (payload: { itemAId: string; itemBId: string }) => debateItems(payload),
    onSuccess: (data) => {
      setResult(data);
      setPhase('result');
    },
  });

  function handleSelect(id: string) {
    setSelectedIds(([a, b]) => {
      if (id === a) return [b, null];
      if (id === b) return [a, null];
      if (a === null) return [id, b];
      if (b === null) return [a, id];
      return [a, id];
    });
  }

  function handleConfirm() {
    const [idA, idB] = selectedIds;
    if (!idA || !idB) return;
    const a = matches.find((m) => m.id === idA) ?? null;
    const b = matches.find((m) => m.id === idB) ?? null;
    setPendingA(a);
    setPendingB(b);
    setPhase('loading');
    runDebate({ itemAId: idA, itemBId: idB });
  }

  function handleReset() {
    setPhase('selecting');
    setSelectedIds([null, null]);
    setResult(null);
    setPendingA(null);
    setPendingB(null);
  }

  return (
    <AnimatePresence mode="wait">
      {phase === 'selecting' && (
        <motion.div key="selector" className="contents">
          <DebateSelector
            matches={matches}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onConfirm={handleConfirm}
            onBack={onBack}
          />
        </motion.div>
      )}

      {phase === 'loading' && pendingA && pendingB && (
        <motion.div key="loading" className="contents">
          <LoadingDebate titleA={pendingA.titulo} titleB={pendingB.titulo} />
        </motion.div>
      )}

      {phase === 'result' && result && (
        <motion.div key="result" className="contents">
          <ResultView result={result} onReset={handleReset} onBack={onBack} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
