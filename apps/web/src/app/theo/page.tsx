'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TheoIntro } from '@/components/theo/theo-intro';
import { TheoServices } from '@/components/theo/theo-services';
import { TheoChat } from '@/components/theo/theo-chat';
import type { TheoTipoFilter } from '@/types/theo';

export default function TheoPage() {
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [pendingTipoFilter, setPendingTipoFilter] = useState<TheoTipoFilter | undefined>();
  const [chatStarted, setChatStarted] = useState(false);

  function handleServiceSelect(message: string, tipoFilter?: TheoTipoFilter) {
    setChatStarted(true);
    setPendingMessage(message);
    setPendingTipoFilter(tipoFilter);
  }

  return (
    <motion.main
      className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-6 px-4 pt-8 pb-28"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Link
        href="/"
        className="flex w-fit items-center gap-2 text-xs text-zinc-600 transition-colors hover:text-zinc-400"
      >
        <ArrowLeft size={14} />
        voltar
      </Link>

      <TheoIntro />

      <motion.div
        className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
      />

      <AnimatePresence mode="wait">
        {!chatStarted ? (
          <motion.div
            key="services"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <TheoServices onSelect={handleServiceSelect} />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TheoChat
              initialMessage={pendingMessage ?? undefined}
              initialTipoFilter={pendingTipoFilter}
              onInitialMessageConsumed={() => {
                setPendingMessage(null);
                setPendingTipoFilter(undefined);
              }}
            />

            <button
              onClick={() => {
                setChatStarted(false);
                setPendingMessage(null);
                setPendingTipoFilter(undefined);
              }}
              className="mt-1 text-center text-xs text-zinc-700 transition-colors hover:text-zinc-400"
            >
              Começar de novo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
