'use client';

import { motion } from 'framer-motion';
import { Film } from 'lucide-react';
import type { DebateItem } from '@/types/theo';

interface DebateArenaProps {
  itemA: DebateItem;
  itemB: DebateItem;
  winner: 'A' | 'B' | 'tie' | null;
  revealed: boolean;
}

function FighterPill({
  item,
  side,
  winner,
  revealed,
}: {
  item: DebateItem;
  side: 'A' | 'B';
  winner: 'A' | 'B' | 'tie' | null;
  revealed: boolean;
}) {
  const isA = side === 'A';
  const color = isA ? '#ff2ea6' : '#8b5cf6';
  const isWinner = revealed && winner === side;
  const isLoser = revealed && winner !== 'tie' && winner !== null && winner !== side;

  return (
    <motion.div
      className="flex flex-1 items-center gap-2.5 overflow-hidden rounded-2xl px-3 py-2.5"
      style={{
        background: isWinner ? `${color}12` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isWinner ? color + '50' : 'rgba(255,255,255,0.07)'}`,
        filter: isLoser ? 'grayscale(0.6) brightness(0.5)' : 'none',
        transition: 'filter 0.7s ease, background 0.5s ease, border-color 0.5s ease',
      }}
      initial={{ opacity: 0, x: isA ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
    >
      {/* Tiny poster */}
      <div
        className="relative shrink-0 overflow-hidden rounded-lg"
        style={{ width: 34, height: 48 }}
      >
        {item.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.posterUrl} alt={item.titulo} className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: `${color}15` }}
          >
            <Film size={12} style={{ color: `${color}50` }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className="text-[9px] font-black uppercase tracking-widest"
            style={{ color: isWinner ? color : `${color}60` }}
          >
            {side}
          </span>
          {isWinner && (
            <motion.span
              className="rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-white"
              style={{ background: color }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              vencedor
            </motion.span>
          )}
        </div>
        <p className="mt-0.5 truncate text-[12px] font-semibold text-white/80">
          {item.titulo}
        </p>
        {item.anoLancamento && (
          <p className="text-[10px]" style={{ color: `${color}50` }}>
            {item.anoLancamento}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export function DebateArena({ itemA, itemB, winner, revealed }: DebateArenaProps) {
  return (
    <div className="shrink-0 px-4 pt-2">
      <div className="flex items-center gap-2">
        <FighterPill item={itemA} side="A" winner={winner} revealed={revealed} />

        {/* VS pip */}
        <div className="flex shrink-0 flex-col items-center gap-0.5">
          <motion.div
            className="h-4 w-px"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.12))' }}
          />
          <motion.span
            className="text-[9px] font-black tracking-widest text-white/20"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            vs
          </motion.span>
          <motion.div
            className="h-4 w-px"
            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.12), transparent)' }}
          />
        </div>

        <FighterPill item={itemB} side="B" winner={winner} revealed={revealed} />
      </div>
    </div>
  );
}
