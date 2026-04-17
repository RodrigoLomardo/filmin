'use client';

import { motion } from 'framer-motion';
import { PERIOD_LABELS } from '../constants';
import type { RetroData, RetroPeriod } from '@/types/stats';

interface SlideShareProps {
  data: RetroData;
  period: RetroPeriod;
  active: boolean;
}

function buildStats(data: RetroData) {
  const avgRating =
    data.ratings.average != null
      ? data.ratings.average.toFixed(1)
      : data.ratings.userA != null
        ? data.ratings.userA.toFixed(1)
        : null;

  return [
    { label: 'itens',  value: String(data.totalItems) },
    { label: 'horas',  value: String(data.screenTime) },
    { label: 'gênero', value: data.genres.top ?? '—' },
    { label: 'nota',   value: avgRating ?? '—' },
    { label: 'streak', value: data.streak > 0 ? `${data.streak}d` : '—' },
    { label: 'melhor', value: data.highlights.best?.titulo ?? '—' },
  ];
}

export function SlideShare({ data, period, active }: SlideShareProps) {
  const stats = buildStats(data);

  return (
    <div className="relative flex h-full w-full items-center justify-center px-6">
      <CardGlow active={active} />

      <motion.div
        className="relative w-full max-w-[300px] overflow-hidden rounded-3xl"
        style={{
          background: 'linear-gradient(145deg, #141416 0%, #0f0f11 100%)',
          boxShadow:
            '0 0 0 1px rgba(255,255,255,0.07), 0 32px 64px rgba(0,0,0,0.6), 0 0 40px rgba(255,46,166,0.08)',
        }}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={active ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
        transition={{ delay: 0.15, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <TopShimmer />
        <CardHeader period={period} active={active} />
        <StatsGrid stats={stats} active={active} />
        <CardFooter active={active} />
        <BottomShimmer />
      </motion.div>
    </div>
  );
}

// ── sub-components ────────────────────────────────────────────────────────────

function CardGlow({ active }: { active: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={active ? { opacity: 0.12, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="h-72 w-72 rounded-full bg-pink-500 blur-[80px]" />
    </motion.div>
  );
}

function TopShimmer() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-px"
      style={{
        background:
          'linear-gradient(90deg, transparent, rgba(255,46,166,0.5) 40%, rgba(255,255,255,0.15) 60%, transparent)',
      }}
    />
  );
}

function BottomShimmer() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
      style={{
        background:
          'linear-gradient(90deg, transparent, rgba(255,255,255,0.04) 50%, transparent)',
      }}
    />
  );
}

function CardHeader({ period, active }: { period: RetroPeriod; active: boolean }) {
  return (
    <div className="px-6 pb-4 pt-5">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline">
          <span className="font-cormorant text-[26px] font-light italic leading-none text-white">film</span>
          <span className="font-cormorant text-[26px] font-light italic leading-none text-pink-500">in</span>
        </div>
        <span className="text-[9px] uppercase tracking-[0.35em] text-zinc-600">
          {PERIOD_LABELS[period]}
        </span>
      </div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={active ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          originX: 0,
          background: 'linear-gradient(90deg, rgba(255,46,166,0.6), rgba(255,46,166,0.1) 70%, transparent)',
          height: '1px',
          marginTop: '12px',
        }}
      />
    </div>
  );
}

function StatsGrid({ stats, active }: { stats: { label: string; value: string }[]; active: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-px bg-zinc-800/30">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          className="flex flex-col gap-1 px-6 py-4"
          style={{ background: 'linear-gradient(145deg, #141416, #0f0f11)' }}
          initial={{ opacity: 0, y: 8 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
          transition={{ delay: 0.5 + i * 0.07, duration: 0.4, ease: 'easeOut' }}
        >
          <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-600">{s.label}</span>
          <span className="truncate font-cormorant text-xl font-light italic leading-tight text-white">
            {s.value}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function CardFooter({ active }: { active: boolean }) {
  return (
    <motion.div
      className="flex items-center justify-center px-6 py-4"
      initial={{ opacity: 0 }}
      animate={active ? { opacity: 1 } : { opacity: 0 }}
      transition={{ delay: 1.0, duration: 0.5 }}
    >
      <span className="text-[9px] uppercase tracking-[0.4em] text-zinc-700">
        compartilhe seu resumo
      </span>
    </motion.div>
  );
}
