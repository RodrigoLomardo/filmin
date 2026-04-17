'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStreak } from '@/lib/hooks/use-streak';
import { isFireActive } from '@/lib/streak-utils';
import { StreakFire } from './streak-fire';
import { StreakModal } from './streak-modal';
import { StreakHelpModal } from './streak-help-modal';

type View = 'none' | 'streak' | 'help';

interface StreakDisplayProps {
  onModalOpenChange?: (isOpen: boolean) => void;
}

export function StreakDisplay({ onModalOpenChange }: StreakDisplayProps) {
  const { data: streak, isLoading } = useStreak();
  const [view, setView] = useState<View>('none');

  function changeView(next: View) {
    setView(next);
    onModalOpenChange?.(next !== 'none');
  }

  if (isLoading || !streak) {
    return <div className="h-8 w-14 animate-pulse rounded-full bg-zinc-800/60" />;
  }

  const active = isFireActive(streak);

  return (
    <>
      {/* Trigger button */}
      <motion.button
        className="flex items-center gap-0.5 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-zinc-800/60 active:bg-zinc-800"
        onClick={() => changeView('streak')}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        whileTap={{ scale: 0.93 }}
        aria-label="Ver streak"
      >
        <StreakFire sequencia={streak.sequenciaAtual} isActive={active} size={28} />
        <motion.span
          key={streak.sequenciaAtual}
          className="text-sm font-semibold tabular-nums text-white"
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {streak.sequenciaAtual}
        </motion.span>
      </motion.button>

      {/* Modal do foguinho */}
      <StreakModal
        open={view === 'streak'}
        onClose={() => changeView('none')}
        onHelp={() => changeView('help')}
        streak={streak}
      />

      {/* Modal de ajuda */}
      <StreakHelpModal
        open={view === 'help'}
        onBack={() => changeView('streak')}
        onClose={() => changeView('none')}
      />
    </>
  );
}
