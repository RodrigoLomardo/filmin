'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getRetrospective } from '@/lib/api/stats';
import { SlideContainer } from '@/components/retrospectiva/slide-container';
import { PeriodSelector } from './_components/period-selector';
import { ActionArea } from './_components/action-area';
import type { RetroPeriod } from '@/types/stats';

export default function RetrospectivePage() {
  const [selectedPeriod, setSelectedPeriod] = useState<RetroPeriod | null>(null);
  const [slidesActive, setSlidesActive] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['retrospective', selectedPeriod],
    queryFn: () => getRetrospective(selectedPeriod!),
    enabled: selectedPeriod != null,
    staleTime: 1000 * 60 * 5,
  });

  if (slidesActive && data) {
    return (
      <SlideContainer
        data={data}
        period={selectedPeriod!}
        onExit={() => setSlidesActive(false)}
      />
    );
  }

  return (
    <motion.main
      className="mx-auto flex min-h-screen w-full max-w-sm flex-col gap-8 px-5 pt-10 pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <PageHeader />

      <PeriodSelector selected={selectedPeriod} onSelect={setSelectedPeriod} />

      <AnimatePresence mode="wait">
        {selectedPeriod && (
          <motion.div
            key="action"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <ActionArea
              isLoading={isLoading}
              isError={isError}
              data={data}
              onStart={() => setSlidesActive(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}

function PageHeader() {
  return (
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
  );
}
