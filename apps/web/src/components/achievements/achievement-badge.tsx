'use client';

import { motion } from 'framer-motion';
import type { Achievement } from '@/types/achievement';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  delay?: number;
}

export function AchievementBadge({
  achievement,
  size = 'md',
  showProgress = true,
  delay = 0,
}: AchievementBadgeProps) {
  const { unlocked, icone, nome, descricao, progress } = achievement;

  const sizeMap = {
    sm: { container: 'w-16 h-16', emoji: 'text-2xl', name: 'text-[9px]' },
    md: { container: 'w-20 h-20', emoji: 'text-3xl', name: 'text-[10px]' },
    lg: { container: 'w-24 h-24', emoji: 'text-4xl', name: 'text-xs' },
  };

  const s = sizeMap[size];
  const progressPct =
    progress ? Math.min(100, Math.round((progress.current / progress.target) * 100)) : 0;

  return (
    <motion.div
      className="flex flex-col items-center gap-1.5"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay }}
    >
      <div className="relative">
        <motion.div
          className={`${s.container} relative flex items-center justify-center rounded-2xl`}
          style={{
            background: unlocked
              ? 'linear-gradient(135deg, rgba(255,46,166,0.15), rgba(168,85,247,0.15))'
              : 'rgba(39,39,42,0.6)',
            border: unlocked
              ? '1px solid rgba(255,46,166,0.3)'
              : '1px solid rgba(255,255,255,0.06)',
            filter: unlocked ? 'none' : 'grayscale(1)',
            boxShadow: unlocked
              ? '0 0 16px rgba(255,46,166,0.15), inset 0 1px 0 rgba(255,255,255,0.08)'
              : 'none',
          }}
          whileHover={unlocked ? { scale: 1.05, boxShadow: '0 0 24px rgba(255,46,166,0.25)' } : {}}
          transition={{ duration: 0.2 }}
        >
          <span
            className={s.emoji}
            style={{ filter: unlocked ? 'none' : 'grayscale(1) opacity(0.35)' }}
          >
            {icone}
          </span>

          {/* Brilho no canto quando desbloqueado */}
          {unlocked && (
            <motion.div
              className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-pink-400"
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </motion.div>

        {/* Barra de progresso (arco) — só para não desbloqueados com progresso */}
        {!unlocked && showProgress && progress && (
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 80 80"
            fill="none"
          >
            <circle
              cx="40"
              cy="40"
              r="37"
              stroke="rgba(255,46,166,0.15)"
              strokeWidth="3"
              fill="none"
            />
            <circle
              cx="40"
              cy="40"
              r="37"
              stroke="rgba(255,46,166,0.6)"
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 37}`}
              strokeDashoffset={`${2 * Math.PI * 37 * (1 - progressPct / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
            />
          </svg>
        )}
      </div>

      <div className="flex flex-col items-center gap-0.5 text-center max-w-[80px]">
        <span
          className={`${s.name} font-semibold leading-tight`}
          style={{ color: unlocked ? '#f4f4f5' : '#52525b' }}
        >
          {nome}
        </span>
        {!unlocked && showProgress && progress && (
          <span className="text-[8px] text-pink-600 font-medium">
            {progress.current}/{progress.target}
          </span>
        )}
      </div>

      {/* Tooltip com descricao */}
      <p
        className="hidden"
        title={descricao}
      />
    </motion.div>
  );
}
