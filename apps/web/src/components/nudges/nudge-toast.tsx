'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Clock, Play, X, Zap } from 'lucide-react';
import type { Nudge, NudgeType } from '@/types/nudge';

const TYPE_ICON: Record<NudgeType, React.ElementType> = {
  session: Clock,
  continuity: Play,
  inactivity: Zap,
};

interface NudgeToastProps {
  nudge: Nudge;
  onDismiss: () => void;
}

export function NudgeToast({ nudge, onDismiss }: NudgeToastProps) {
  const [visible, setVisible] = useState(false);
  const Icon = TYPE_ICON[nudge.type];

  // Entra com pequeno delay para a animação ser visível após o mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  function handleDismiss() {
    setVisible(false);
    setTimeout(onDismiss, 300);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed left-1/2 top-5 z-[100] w-[min(360px,calc(100vw-32px))] -translate-x-1/2"
        >
          <div className="relative flex gap-3 rounded-2xl bg-zinc-900/95 px-4 py-3.5 shadow-2xl shadow-black/50 ring-1 ring-white/10 backdrop-blur-md">
            {/* Glow sutil */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-pink-500/[0.04]" />

            {/* Ícone do Theo */}
            <div className="mt-0.5 flex shrink-0 flex-col items-center gap-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-500/15 ring-1 ring-pink-500/25">
                <Bell size={13} className="text-pink-400" />
              </div>
              <Icon size={11} className="text-zinc-600" />
            </div>

            {/* Conteúdo */}
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 text-[11px] font-medium uppercase tracking-widest text-pink-400/70">
                Theo
              </p>
              <p className="text-sm leading-relaxed text-zinc-200">{nudge.message}</p>
            </div>

            {/* Fechar */}
            <button
              onClick={handleDismiss}
              className="ml-1 mt-0.5 shrink-0 text-zinc-600 transition hover:text-zinc-400"
              aria-label="Fechar"
            >
              <X size={14} />
            </button>

            {/* Barra de progresso auto-dismiss */}
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] rounded-full bg-pink-500/40"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 6, ease: 'linear' }}
              onAnimationComplete={handleDismiss}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
