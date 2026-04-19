'use client';

import { motion } from 'framer-motion';

export interface FireTheme {
  outer: string;
  mid: string;
  core: string;
  glow: string;
  glowRgb: string;
}

export const FIRE_TIERS: { min: number; max: number | null; theme: FireTheme; label: string; emoji: string }[] = [
  {
    min: 0, max: 0,
    label: 'Sem sequência',
    emoji: '💤',
    theme: {
      outer: '#3f3f46',
      mid: '#27272a',
      core: '#52525b',
      glow: 'transparent',
      glowRgb: '0,0,0',
    },
  },
  {
    min: 1, max: 9,
    label: 'Iniciante',
    emoji: '🔥',
    theme: {
      outer: '#ff6b1a',
      mid: '#ff3d00',
      core: '#ffe066',
      glow: 'rgba(255,107,26,0.55)',
      glowRgb: '255,107,26',
    },
  },
  {
    min: 10, max: 29,
    label: 'Aquecendo',
    emoji: '🔥',
    theme: {
      outer: '#facc15',
      mid: '#f59e0b',
      core: '#fef9c3',
      glow: 'rgba(250,204,21,0.55)',
      glowRgb: '250,204,21',
    },
  },
  {
    min: 30, max: 59,
    label: 'Em chamas',
    emoji: '🔥',
    theme: {
      outer: '#38bdf8',
      mid: '#0ea5e9',
      core: '#e0f2fe',
      glow: 'rgba(56,189,248,0.55)',
      glowRgb: '56,189,248',
    },
  },
  {
    min: 60, max: 99,
    label: 'Lendário',
    emoji: '🔥',
    theme: {
      outer: '#c084fc',
      mid: '#a855f7',
      core: '#fae8ff',
      glow: 'rgba(192,132,252,0.6)',
      glowRgb: '192,132,252',
    },
  },
  {
    min: 100, max: null,
    label: 'Transcendente',
    emoji: '🔥',
    theme: {
      outer: '#ff2ea6',
      mid: '#f9126e',
      core: '#ffe6f3',
      glow: 'rgba(255,46,166,0.65)',
      glowRgb: '255,46,166',
    },
  },
];

export function getFireTheme(sequencia: number): FireTheme {
  const tier = FIRE_TIERS.find(
    (t) => sequencia >= t.min && (t.max === null || sequencia <= t.max),
  );
  return tier?.theme ?? FIRE_TIERS[1].theme;
}

export function getTierLabel(sequencia: number): string {
  const tier = FIRE_TIERS.find(
    (t) => sequencia >= t.min && (t.max === null || sequencia <= t.max),
  );
  return tier?.label ?? '';
}

interface StreakFireProps {
  sequencia: number;
  /** Sobrescreve o estado vivo/apagado. Se omitido, usa sequencia === 0. */
  isActive?: boolean;
  size?: number;
}

export function StreakFire({ sequencia, isActive, size = 32 }: StreakFireProps) {
  const theme = getFireTheme(sequencia);
  // isDead: apagado se nunca houve atividade OU se o período atual expirou
  const isDead = isActive !== undefined ? !isActive : sequencia === 0;

  return (
    <motion.div
      style={{
        width: size,
        height: size,
        filter: isDead ? 'none' : `drop-shadow(0 0 ${size * 0.28}px ${theme.glow}) drop-shadow(0 0 ${size * 0.14}px ${theme.glow})`,
      }}
      animate={isDead ? { scale: 1 } : { scale: [1, 1.06, 1, 1.04, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg
        viewBox="0 0 32 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
      >
        <defs>
          {/* Glow filter */}
          <filter id={`glow-${sequencia}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Gradient — outer flame */}
          <linearGradient id={`grad-outer-${sequencia}`} x1="16" y1="2" x2="16" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={theme.outer} />
            <stop offset="100%" stopColor={theme.mid} />
          </linearGradient>

          {/* Gradient — inner */}
          <radialGradient id={`grad-core-${sequencia}`} cx="50%" cy="60%" r="50%">
            <stop offset="0%" stopColor={theme.core} stopOpacity="1" />
            <stop offset="100%" stopColor={theme.mid} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── Outer glow halo (blurred copy) ── */}
        {!isDead && (
          <motion.path
            d="M16 2 C14 5 10 9 9 13 C8 16 8.5 19 10 21.5 C10 21.5 10.5 19.5 12 18.5 C12 20.5 13 23.5 16 25 C19 23.5 20 20.5 20 18.5 C21.5 19.5 22 21.5 22 21.5 C23.5 19 24 16 23 13 C22 9 18 5 16 2Z"
            fill={theme.outer}
            filter={`url(#glow-${sequencia})`}
            opacity={0.35}
            animate={{ opacity: [0.25, 0.4, 0.25] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* ── Main flame body ── */}
        <motion.path
          d="M16 2 C14 5 10 9 9 13 C8 16 8.5 19 10 21.5 C10 21.5 10.5 19.5 12 18.5 C12 20.5 13 23.5 16 25 C19 23.5 20 20.5 20 18.5 C21.5 19.5 22 21.5 22 21.5 C23.5 19 24 16 23 13 C22 9 18 5 16 2Z"
          fill={`url(#grad-outer-${sequencia})`}
          animate={isDead ? {} : {
            d: [
              "M16 2 C14 5 10 9 9 13 C8 16 8.5 19 10 21.5 C10 21.5 10.5 19.5 12 18.5 C12 20.5 13 23.5 16 25 C19 23.5 20 20.5 20 18.5 C21.5 19.5 22 21.5 22 21.5 C23.5 19 24 16 23 13 C22 9 18 5 16 2Z",
              "M16 2 C13.5 5.5 10 9.5 9.5 13.5 C8.5 16.5 9 19 10.5 21.5 C10.5 21.5 10.5 19 12 18 C12.5 20.5 13.5 23.5 16 25 C18.5 23.5 19.5 20.5 20 18 C21.5 19 21.5 21.5 21.5 21.5 C23 19 23.5 16.5 22.5 13.5 C22 9.5 18.5 5.5 16 2Z",
              "M16 2 C14 5 10.5 9 9 13 C7.5 16 8 19 10 22 C10 22 10.5 20 12.5 18.5 C12 21 13 24 16 25 C19 24 20 21 19.5 18.5 C21.5 20 22 22 22 22 C24 19 24.5 16 23 13 C21.5 9 18 5 16 2Z",
              "M16 2 C14 5 10 9 9 13 C8 16 8.5 19 10 21.5 C10 21.5 10.5 19.5 12 18.5 C12 20.5 13 23.5 16 25 C19 23.5 20 20.5 20 18.5 C21.5 19.5 22 21.5 22 21.5 C23.5 19 24 16 23 13 C22 9 18 5 16 2Z",
            ],
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* ── Small side tongue (lick) — only when alive ── */}
        {!isDead && (
          <motion.path
            d="M10 13 C9 11 9.5 9 11 8 C11 8 10 10 10.5 12 C11 14 12.5 14.5 12 16 C11 14.5 10.5 14 10 13Z"
            fill={theme.core}
            opacity={0.6}
            animate={{ opacity: [0.4, 0.7, 0.4], scaleX: [1, 1.1, 1] }}
            style={{ originX: '10px', originY: '12px' }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          />
        )}

        {/* ── Inner bright core ── */}
        <motion.ellipse
          cx="16"
          cy="19"
          rx="3.5"
          ry="5"
          fill={`url(#grad-core-${sequencia})`}
          animate={isDead ? { opacity: 0.15 } : { opacity: [0.7, 1, 0.75] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />

        {/* ── Dead state: X mark ── */}
        {isDead && (
          <motion.path
            d="M13 16 L19 22 M19 16 L13 22"
            stroke="#52525b"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </svg>
    </motion.div>
  );
}
