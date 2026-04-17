'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { slideVariants, slideTransition } from './constants';
import { SlideProgressBar } from './slide-progress-bar';
import { SlideIntro } from './slides/slide-intro';
import { SlideTotals } from './slides/slide-totals';
import { SlideGenre } from './slides/slide-genre';
import { SlideRatings } from './slides/slide-ratings';
import { SlideHighlights } from './slides/slide-highlights';
import { SlideScreenTime } from './slides/slide-screen-time';
import { SlideStreak } from './slides/slide-streak';
import { SlideShare } from './slides/slide-share';
import type { RetroData, RetroPeriod } from '@/types/stats';

interface SlideContainerProps {
  data: RetroData;
  period: RetroPeriod;
  onExit: () => void;
}

const TOTAL_SLIDES = 8;

export function SlideContainer({ data, period, onExit }: SlideContainerProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const dragStart = useRef<number | null>(null);

  function go(next: number) {
    if (next < 0 || next >= TOTAL_SLIDES) return;
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
      const half = (e.currentTarget as HTMLElement).offsetWidth / 2;
      go(e.clientX < half ? current - 1 : current + 1);
    } else {
      if (delta < -40) go(current + 1);
      else if (delta > 40) go(current - 1);
    }
  }

  const slides = [
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

      <SlideProgressBar current={current} total={TOTAL_SLIDES} onClose={onExit} />

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
            transition={slideTransition}
            className="absolute flex h-full w-full items-center justify-center"
          >
            {slides[current]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom area */}
      <div className="relative z-10 pb-10 text-center">
        <AnimatePresence mode="wait">
          {current === TOTAL_SLIDES - 1 ? (
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
              {current + 1} / {TOTAL_SLIDES}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
