'use client';

import { motion } from 'framer-motion';
import type { TheoDebateResponse } from '@/types/theo';

interface DebateVerdictProps {
  result: TheoDebateResponse;
}

export function DebateVerdict({ result }: DebateVerdictProps) {
  const { winner, verdict, itemA, itemB } = result;

  const winnerItem = winner === 'A' ? itemA : winner === 'B' ? itemB : null;
  const winnerColor =
    winner === 'A' ? '#ff2ea6' : winner === 'B' ? '#8b5cf6' : '#f59e0b';

  return (
    <motion.div
      className="mx-4 mt-6 mb-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1], delay: 0.2 }}
    >
      {/* Section label */}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/5" />
        <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/20">
          Veredicto
        </span>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      {/* Verdict card */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: `${winnerColor}06`,
          border: `1px solid ${winnerColor}20`,
        }}
      >
        {/* Theo bar */}
        <div
          className="flex items-center gap-2.5 px-4 py-3"
          style={{ borderBottom: `1px solid ${winnerColor}10` }}
        >
          {/* Animated Theo avatar */}
          <motion.div
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white"
            style={{ background: 'linear-gradient(135deg, #ff2ea6, #8b5cf6)' }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            T
          </motion.div>

          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">
              Theo escolheu
            </p>
            {winnerItem ? (
              <motion.p
                className="truncate text-[13px] font-bold"
                style={{ color: winnerColor }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {winnerItem.titulo}
              </motion.p>
            ) : (
              <motion.p
                className="text-[13px] font-bold"
                style={{ color: winnerColor }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                Empate técnico
              </motion.p>
            )}
          </div>

          {/* Winner side badge */}
          {winner !== 'tie' && (
            <motion.div
              className="shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white"
              style={{ background: winnerColor }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.25 }}
            >
              {winner}
            </motion.div>
          )}
        </div>

        {/* Verdict text */}
        <motion.div
          className="px-4 py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <p className="text-[13px] leading-relaxed text-white/60">{verdict}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
