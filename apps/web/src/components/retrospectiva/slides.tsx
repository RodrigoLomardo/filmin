'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { RetroData, RetroPeriod } from '@/types/stats';

// ── helpers ─────────────────────────────────────────────────────────────────

function useCounted(target: number, active: boolean, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    setValue(0);
    const steps = 40;
    const step = duration / steps;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setValue(Math.round((target * i) / steps));
      if (i >= steps) clearInterval(timer);
    }, step);
    return () => clearInterval(timer);
  }, [active, target, duration]);
  return value;
}

const PERIOD_LABELS: Record<RetroPeriod, string> = {
  month: 'este mês',
  quarter: 'estes 3 meses',
  year: 'este ano',
  all: 'de sempre',
};

// ── slide wrappers ───────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

const transition = { duration: 0.38, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

// ── individual slides ────────────────────────────────────────────────────────

function SlideIntro({ period, active }: { period: RetroPeriod; active: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-64 w-64 rounded-full bg-pink-500/15 blur-3xl" />
      </motion.div>

      <motion.p
        className="text-xs uppercase tracking-[0.35em] text-pink-400"
        initial={{ opacity: 0, y: 10 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        filmin · retrospectiva
      </motion.p>

      <motion.h1
        className="font-cormorant text-5xl font-light italic leading-tight text-white md:text-6xl"
        initial={{ opacity: 0, y: 20 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ delay: 0.28, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        seu resumo
        <br />
        <span className="text-pink-400">{PERIOD_LABELS[period]}</span>
      </motion.h1>

      <motion.p
        className="text-sm text-zinc-500"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
      >
        toque para avançar
      </motion.p>
    </div>
  );
}

function SlideTotals({ data, active }: { data: RetroData; active: boolean }) {
  const filmes = useCounted(data.byTipo.filme, active);
  const series = useCounted(data.byTipo.serie, active);
  const livros = useCounted(data.byTipo.livro, active);
  const total = useCounted(data.totalItems, active, 900);

  const items = [
    { label: 'filmes', value: filmes, color: 'text-pink-400' },
    { label: 'séries', value: series, color: 'text-violet-400' },
    { label: 'livros', value: livros, color: 'text-sky-400' },
  ];

  return (
    <div className="flex flex-col items-center justify-center gap-8 px-8 text-center">
      <motion.p
        className="text-xs uppercase tracking-[0.35em] text-zinc-500"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.1 }}
      >
        você consumiu
      </motion.p>

      <motion.div
        className="flex items-baseline gap-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="font-cormorant text-8xl font-light leading-none text-white md:text-9xl">
          {total}
        </span>
        <span className="text-lg text-zinc-400">itens</span>
      </motion.div>

      <div className="flex gap-8">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, y: 16 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.4, ease: 'easeOut' }}
          >
            <span className={`font-cormorant text-4xl font-light ${item.color}`}>{item.value}</span>
            <span className="text-xs text-zinc-500">{item.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SlideGenre({ data, active }: { data: RetroData; active: boolean }) {
  const max = data.genres.distribution[0]?.count ?? 1;

  return (
    <div className="flex w-full max-w-sm flex-col items-center justify-center gap-6 px-8">
      <motion.p
        className="text-xs uppercase tracking-[0.35em] text-zinc-500"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.1 }}
      >
        gênero favorito
      </motion.p>

      <motion.h2
        className="font-cormorant text-5xl font-light italic text-pink-400 md:text-6xl"
        initial={{ opacity: 0, y: 18 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {data.genres.top ?? '—'}
      </motion.h2>

      <div className="w-full space-y-2">
        {data.genres.distribution.map((g, i) => (
          <motion.div
            key={g.nome}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -16 }}
            animate={active ? { opacity: 1, x: 0 } : { opacity: 0 }}
            transition={{ delay: 0.35 + i * 0.08, duration: 0.4, ease: 'easeOut' }}
          >
            <span className="w-24 truncate text-right text-xs text-zinc-400">{g.nome}</span>
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-pink-500"
                initial={{ width: 0 }}
                animate={active ? { width: `${(g.count / max) * 100}%` } : { width: 0 }}
                transition={{ delay: 0.45 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <span className="w-6 text-left text-xs text-zinc-500">{g.count}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SlideRatings({ data, active }: { data: RetroData; active: boolean }) {
  const isDuo = data.ratings.userA !== undefined || data.ratings.userB !== undefined;

  return (
    <div className="flex flex-col items-center justify-center gap-8 px-8 text-center">
      <motion.p
        className="text-xs uppercase tracking-[0.35em] text-zinc-500"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.1 }}
      >
        média de notas
      </motion.p>

      {isDuo ? (
        <div className="flex gap-12">
          {[
            { label: 'ele', value: data.ratings.userA, color: 'text-violet-400' },
            { label: 'ela', value: data.ratings.userB, color: 'text-pink-400' },
          ].map((u, i) => (
            <motion.div
              key={u.label}
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className={`font-cormorant text-7xl font-light ${u.color}`}>
                {u.value != null ? u.value.toFixed(1) : '—'}
              </span>
              <span className="text-xs text-zinc-500">{u.label}</span>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-2"
        >
          <span className="font-cormorant text-8xl font-light text-pink-400">
            {data.ratings.average != null ? data.ratings.average.toFixed(1) : '—'}
          </span>
          <span className="text-xs text-zinc-500">em 10 pontos</span>
        </motion.div>
      )}
    </div>
  );
}

function PosterCard({
  item,
  label,
  labelColor,
  active,
  delay,
}: {
  item: RetroData['highlights']['best'];
  label: string;
  labelColor: string;
  active: boolean;
  delay: number;
}) {
  if (!item) return null;
  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative h-28 w-20 overflow-hidden rounded-lg ring-1 ring-white/10">
        {item.posterUrl ? (
          <Image src={item.posterUrl} alt={item.titulo} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-2xl">
            {item.tipo === 'filme' ? '🎬' : item.tipo === 'serie' ? '📺' : '📚'}
          </div>
        )}
      </div>
      <p className="max-w-[80px] text-center text-xs leading-tight text-zinc-300 line-clamp-2">
        {item.titulo}
      </p>
      <span className={`text-xs font-semibold ${labelColor}`}>
        {label} · {item.nota.toFixed(1)}
      </span>
    </motion.div>
  );
}

function SlideHighlights({ data, active }: { data: RetroData; active: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 px-8 text-center">
      <motion.p
        className="text-xs uppercase tracking-[0.35em] text-zinc-500"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.1 }}
      >
        destaques
      </motion.p>

      <div className="flex gap-10">
        <PosterCard
          item={data.highlights.best}
          label="melhor"
          labelColor="text-pink-400"
          active={active}
          delay={0.25}
        />
        <PosterCard
          item={data.highlights.worst}
          label="pior"
          labelColor="text-zinc-500"
          active={active}
          delay={0.4}
        />
      </div>

      {!data.highlights.best && (
        <p className="text-sm text-zinc-600">sem itens avaliados no período</p>
      )}
    </div>
  );
}

function SlideScreenTime({ data, active }: { data: RetroData; active: boolean }) {
  const hours = useCounted(data.screenTime, active, 1000);

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-8 text-center">
      <motion.p
        className="text-xs uppercase tracking-[0.35em] text-zinc-500"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.1 }}
      >
        tempo de tela
      </motion.p>

      <motion.div
        className="flex items-baseline gap-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="font-cormorant text-8xl font-light leading-none text-pink-400 md:text-9xl">
          {hours}
        </span>
        <span className="text-lg text-zinc-400">horas</span>
      </motion.div>

      <motion.p
        className="text-sm text-zinc-600"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        filmes (2h) + séries (10h)
      </motion.p>
    </div>
  );
}

function SlideStreak({ data, active }: { data: RetroData; active: boolean }) {
  const streak = useCounted(data.streak, active, 900);

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-8 text-center">
      <motion.p
        className="text-xs uppercase tracking-[0.35em] text-zinc-500"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.1 }}
      >
        maior sequência
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-2"
      >
        <span className="text-5xl">🔥</span>
        <div className="flex items-baseline gap-2">
          <span className="font-cormorant text-8xl font-light leading-none text-orange-400 md:text-9xl">
            {streak}
          </span>
          <span className="text-lg text-zinc-400">
            {data.streak === 1 ? 'dia' : 'dias'}
          </span>
        </div>
      </motion.div>

      <motion.p
        className="text-sm text-zinc-600"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.5 }}
      >
        assistindo dias consecutivos
      </motion.p>
    </div>
  );
}

function SlideShare({ data, period, active }: { data: RetroData; period: RetroPeriod; active: boolean }) {
  const avgRating =
    data.ratings.average != null
      ? data.ratings.average.toFixed(1)
      : data.ratings.userA != null
        ? data.ratings.userA.toFixed(1)
        : null;

  const stats = [
    { label: 'itens',   value: String(data.totalItems) },
    { label: 'horas',   value: String(data.screenTime) },
    { label: 'gênero',  value: data.genres.top ?? '—' },
    { label: 'nota',    value: avgRating ?? '—' },
    { label: 'streak',  value: data.streak > 0 ? `${data.streak}d` : '—' },
    { label: 'melhor',  value: data.highlights.best?.titulo ?? '—' },
  ];

  return (
    <div className="relative flex h-full w-full items-center justify-center px-6">

      {/* Glow behind the card */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={active ? { opacity: 0.12, scale: 1 } : { opacity: 0, scale: 0.5 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="h-72 w-72 rounded-full bg-pink-500 blur-[80px]" />
      </motion.div>

      {/* Card */}
      <motion.div
        className="relative w-full max-w-[300px] overflow-hidden rounded-3xl"
        style={{
          background: 'linear-gradient(145deg, #141416 0%, #0f0f11 100%)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.07), 0 32px 64px rgba(0,0,0,0.6), 0 0 40px rgba(255,46,166,0.08)',
        }}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={active ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
        transition={{ delay: 0.15, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Top shimmer edge */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,46,166,0.5) 40%, rgba(255,255,255,0.15) 60%, transparent)' }}
        />

        {/* Header */}
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

          {/* Pink rule */}
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

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-px bg-zinc-800/30 px-0">
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

        {/* Bottom tag */}
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

        {/* Bottom shimmer edge */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04) 50%, transparent)' }}
        />
      </motion.div>
    </div>
  );
}

// ── main container ───────────────────────────────────────────────────────────

interface RetrospectiveSlidesProps {
  data: RetroData;
  period: RetroPeriod;
  onExit: () => void;
}

export function RetrospectiveSlides({ data, period, onExit }: RetrospectiveSlidesProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const dragStart = useRef<number | null>(null);

  const totalSlides = 8;

  function go(next: number) {
    if (next < 0 || next >= totalSlides) return;
    setDirection(next > current ? 1 : -1);
    setCurrent(next);
  }

  function handlePointerDown(e: React.PointerEvent) {
    dragStart.current = e.clientX;
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (dragStart.current == null) return;
    const delta = e.clientX - dragStart.current;
    dragStart.current = null;
    if (Math.abs(delta) < 8) {
      // tap: left half = prev, right half = next
      const half = (e.currentTarget as HTMLElement).offsetWidth / 2;
      if (e.clientX < half) go(current - 1);
      else go(current + 1);
    } else {
      if (delta < -40) go(current + 1);
      else if (delta > 40) go(current - 1);
    }
  }

  const slideComponents = [
    <SlideIntro key="intro" period={period} active={current === 0} />,
    <SlideTotals key="totals" data={data} active={current === 1} />,
    <SlideGenre key="genre" data={data} active={current === 2} />,
    <SlideRatings key="ratings" data={data} active={current === 3} />,
    <SlideHighlights key="highlights" data={data} active={current === 4} />,
    <SlideScreenTime key="screentime" data={data} active={current === 5} />,
    <SlideStreak key="streak" data={data} active={current === 6} />,
    <SlideShare key="share" data={data} period={period} active={current === 7} />,
  ];

  return (
    <div
      className="relative flex h-screen w-full touch-none select-none flex-col overflow-hidden bg-black"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/[0.06] blur-3xl" />
      </div>

      {/* Progress dots */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-6">
        <button
          className="p-1 text-zinc-600 transition-colors hover:text-zinc-400"
          onClick={onExit}
          aria-label="Fechar"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="flex gap-1.5">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <motion.div
              key={i}
              className="h-1 rounded-full bg-zinc-700"
              animate={{ width: i === current ? 20 : 6, backgroundColor: i === current ? '#ec4899' : '#3f3f46' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
          ))}
        </div>

        <div className="w-7" />
      </div>

      {/* Slide content */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <AnimatePresence custom={direction} mode="popLayout">
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="absolute flex h-full w-full items-center justify-center"
          >
            {slideComponents[current]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom area */}
      <div className="relative z-10 pb-10 text-center">
        <AnimatePresence mode="wait">
          {current === totalSlides - 1 ? (
            <motion.button
              key="go-home"
              className="mx-auto flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white ring-1 ring-white/10 transition-colors hover:bg-zinc-800"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ delay: 0.7, duration: 0.35, ease: 'easeOut' }}
              whileTap={{ scale: 0.96 }}
              onClick={onExit}
            >
              voltar ao início
            </motion.button>
          ) : (
            <motion.p
              key="counter"
              className="text-[10px] uppercase tracking-widest text-zinc-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {current + 1} / {totalSlides}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
