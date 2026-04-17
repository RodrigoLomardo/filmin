'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getRetrospective } from '@/lib/api/stats';
import { RetrospectiveSlides } from '@/components/retrospectiva/slides';
import type { RetroPeriod } from '@/types/stats';

const PERIODS: { value: RetroPeriod; label: string; sub: string }[] = [
  { value: 'month', label: 'este mês', sub: 'últimos 30 dias' },
  { value: 'quarter', label: '3 meses', sub: 'últimos 90 dias' },
  { value: 'year', label: 'este ano', sub: `em ${new Date().getFullYear()}` },
  { value: 'all', label: 'todo tempo', sub: 'desde o início' },
];

export default function RetrospectivePage() {
  const [selectedPeriod, setSelectedPeriod] = useState<RetroPeriod | null>(null);
  const [slidesActive, setSlidesActive] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['retrospective', selectedPeriod],
    queryFn: () => getRetrospective(selectedPeriod!),
    enabled: selectedPeriod != null,
    staleTime: 1000 * 60 * 5,
  });

  function handleSelectPeriod(period: RetroPeriod) {
    setSelectedPeriod(period);
  }

  function handleStart() {
    if (data) setSlidesActive(true);
  }

  function handleExit() {
    setSlidesActive(false);
  }

  if (slidesActive && data) {
    return (
      <RetrospectiveSlides data={data} period={selectedPeriod!} onExit={handleExit} />
    );
  }

  return (
    <motion.main
      className="mx-auto flex min-h-screen w-full max-w-sm flex-col gap-8 px-5 pt-10 pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 ring-1 ring-white/10 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-cormorant text-2xl font-light italic text-white">retrospectiva</h1>
          <p className="text-[10px] uppercase tracking-widest text-zinc-600">filmin</p>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-600">escolha o período</p>
        <div className="grid grid-cols-2 gap-3">
          {PERIODS.map((p) => (
            <motion.button
              key={p.value}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelectPeriod(p.value)}
              className={[
                'flex flex-col items-start gap-1 rounded-2xl p-4 text-left ring-1 transition-colors',
                selectedPeriod === p.value
                  ? 'bg-pink-500/10 ring-pink-500/50'
                  : 'bg-zinc-900 ring-white/5 hover:ring-white/15',
              ].join(' ')}
            >
              <span
                className={[
                  'font-cormorant text-xl font-light italic',
                  selectedPeriod === p.value ? 'text-pink-400' : 'text-white',
                ].join(' ')}
              >
                {p.label}
              </span>
              <span className="text-[11px] text-zinc-500">{p.sub}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Action area */}
      <AnimatePresence mode="wait">
        {selectedPeriod && (
          <motion.div
            key="action"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col gap-3"
          >
            {isLoading && (
              <div className="flex items-center gap-3 rounded-2xl bg-zinc-900 p-4 ring-1 ring-white/5">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
                <span className="text-sm text-zinc-400">carregando seus dados...</span>
              </div>
            )}

            {isError && (
              <div className="rounded-2xl bg-zinc-900 p-4 ring-1 ring-red-500/20">
                <p className="text-sm text-red-400">erro ao carregar. tente novamente.</p>
              </div>
            )}

            {data && (
              <>
                {/* Mini preview */}
                <div className="rounded-2xl bg-zinc-900 p-4 ring-1 ring-white/5">
                  <div className="flex justify-between">
                    <Stat label="itens" value={String(data.totalItems)} />
                    <Stat label="horas de tela" value={String(data.screenTime)} />
                    <Stat label="streak" value={`${data.streak}d`} />
                  </div>
                </div>

                <motion.button
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-pink-500 py-4 text-sm font-semibold text-white shadow-[0_0_32px_rgba(255,46,166,0.4)]"
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={handleStart}
                >
                  ver retrospectiva
                </motion.button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-cormorant text-2xl font-light text-pink-400">{value}</span>
      <span className="text-[10px] text-zinc-500">{label}</span>
    </div>
  );
}
