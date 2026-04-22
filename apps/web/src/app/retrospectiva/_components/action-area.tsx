'use client';

import { motion } from 'framer-motion';
import { STREAK_LABELS } from '@/components/retrospectiva/constants';
import type { RetroData } from '@/types/stats';

interface ActionAreaProps {
  isLoading: boolean;
  isError: boolean;
  data: RetroData | undefined;
  onStart: () => void;
}

export function ActionArea({ isLoading, isError, data, onStart }: ActionAreaProps) {
  return (
    <div className="flex flex-col gap-3">
      {isLoading && <LoadingState />}
      {isError && <ErrorState />}
      {data && <ReadyState data={data} onStart={onStart} />}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-zinc-900 p-4 ring-1 ring-white/5">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
      <span className="text-sm text-zinc-400">carregando seus dados...</span>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="rounded-2xl bg-zinc-900 p-4 ring-1 ring-red-500/20">
      <p className="text-sm text-red-400">erro ao carregar. tente novamente.</p>
    </div>
  );
}

function ReadyState({ data, onStart }: { data: RetroData; onStart: () => void }) {
  return (
    <>
      <div className="rounded-2xl bg-zinc-900 p-4 ring-1 ring-white/5">
        <div className="flex justify-between">
          <PreviewStat label="itens" value={String(data.totalItems)} />
          <PreviewStat label="horas de tela" value={String(data.screenTime)} />
          <PreviewStat label="streak" value={data.streak > 0 ? `${data.streak}${STREAK_LABELS[data.streakTipo].short}` : '—'} />
        </div>
      </div>

      <motion.button
        className="flex w-full items-center justify-center rounded-2xl bg-pink-500 py-4 text-sm font-semibold text-white shadow-[0_0_32px_rgba(255,46,166,0.4)]"
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        onClick={onStart}
      >
        ver retrospectiva
      </motion.button>
    </>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-cormorant text-2xl font-light text-pink-400">{value}</span>
      <span className="text-[10px] text-zinc-500">{label}</span>
    </div>
  );
}
