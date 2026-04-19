'use client';

import { motion } from 'framer-motion';
import type { LeaderboardEntry } from '@/types/achievement';

interface LeaderboardRankCardProps {
  entry: LeaderboardEntry;
  unidade: string;
  index: number;
}

const ROMAN = ['', 'I', 'II', 'III'] as const;

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center text-xl">
        👑
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center text-xl">
        🥈
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center text-xl">
        🥉
      </div>
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center">
      <span className="text-sm font-bold text-zinc-500">#{rank}</span>
    </div>
  );
}

function cardStyle(rank: number): React.CSSProperties {
  if (rank === 1) {
    return {
      background: 'linear-gradient(135deg, rgba(255,46,166,0.08), rgba(168,85,247,0.08))',
      border: '1px solid transparent',
      backgroundClip: 'padding-box',
      boxShadow: '0 0 24px rgba(255,46,166,0.12), 0 0 8px rgba(168,85,247,0.08)',
      position: 'relative',
    };
  }
  if (rank === 2) {
    return {
      background: 'rgba(24,24,27,0.7)',
      border: '1px solid rgba(113,113,122,0.4)',
      boxShadow: '0 0 12px rgba(180,180,200,0.05)',
    };
  }
  if (rank === 3) {
    return {
      background: 'rgba(24,24,27,0.7)',
      border: '1px solid rgba(120,53,15,0.4)',
      boxShadow: '0 0 12px rgba(180,100,20,0.06)',
    };
  }
  return {
    background: 'rgba(18,18,20,0.6)',
    border: '1px solid rgba(39,39,42,0.6)',
  };
}

export function LeaderboardRankCard({ entry, unidade, index }: LeaderboardRankCardProps) {
  const isTop3 = entry.rank <= 3;
  const isFirst = entry.rank === 1;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: index * 0.05 }}
    >
      {/* Gradient border wrapper for rank 1 */}
      {isFirst ? (
        <div
          className="rounded-2xl p-[1px]"
          style={{ background: 'linear-gradient(135deg, #ff2ea6, #a855f7)' }}
        >
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{
              background: 'linear-gradient(135deg, rgba(255,46,166,0.06), rgba(168,85,247,0.06))',
              boxShadow: '0 0 24px rgba(255,46,166,0.10), 0 0 8px rgba(168,85,247,0.08)',
            }}
          >
            <RankBadge rank={entry.rank} />
            <CardContent entry={entry} unidade={unidade} isTop3={isTop3} />
          </div>
        </div>
      ) : (
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3"
          style={cardStyle(entry.rank)}
        >
          <RankBadge rank={entry.rank} />
          <CardContent entry={entry} unidade={unidade} isTop3={isTop3} />
        </div>
      )}
    </motion.div>
  );
}

function CardContent({
  entry,
  unidade,
  isTop3,
}: {
  entry: LeaderboardEntry;
  unidade: string;
  isTop3: boolean;
}) {
  return (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate text-sm font-semibold text-white">{entry.displayName}</span>
        {entry.highestLevel != null && (
          <span
            className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #ff2ea6, #a855f7)' }}
          >
            {ROMAN[entry.highestLevel]}
          </span>
        )}
      </div>
      <div className="shrink-0 text-right">
        <span
          className="text-sm font-bold"
          style={
            isTop3
              ? { background: 'linear-gradient(135deg, #ff2ea6, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }
              : { color: 'rgb(161,161,170)' }
          }
        >
          {entry.value}
        </span>
        <span className="ml-1 text-xs text-zinc-600">{unidade}</span>
      </div>
    </>
  );
}
