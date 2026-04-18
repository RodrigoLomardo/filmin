'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useShakeDetection } from '@/lib/hooks/use-shake-detection';
import { useHoldButton } from '@/lib/hooks/use-hold-button';
import { IdleView } from './sorteio/IdleView';
import { SpinningView } from './sorteio/SpinningView';
import { ResultView } from './sorteio/ResultView';
import type { WatchItem } from '@/types/watch-item';

type SpinPhase = 'idle' | 'spinning' | 'result';

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface SorteioMatchScreenProps {
  matches: WatchItem[];
  onBack: () => void;
}

export function SorteioMatchScreen({ matches, onBack }: SorteioMatchScreenProps) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const [phase, setPhase] = useState<SpinPhase>('idle');
  const [chosen, setChosen] = useState<WatchItem | null>(null);
  const [displayedItem, setDisplayedItem] = useState<WatchItem | null>(null);
  const [flipKey, setFlipKey] = useState(0);
  const spinningRef = useRef(false);

  const cardAnim = useAnimation();
  const screenAnim = useAnimation();

  const runSpin = useCallback(async (fromMobile: boolean) => {
    if (spinningRef.current || matches.length === 0) return;
    spinningRef.current = true;

    if (fromMobile) {
      await screenAnim.start({
        x: [0, -10, 10, -8, 8, -4, 4, 0],
        transition: { duration: 0.35, ease: 'easeOut' },
      });
    }

    setPhase('spinning');

    const winner = pickRandom(matches);
    const totalFlips = 22;

    for (let i = 0; i < totalFlips; i++) {
      const progress = i / totalFlips;
      const half = (0.04 + progress * progress * 0.22) / 2;
      const item = i === totalFlips - 1 ? winner : pickRandom(matches);

      if (fromMobile) {
        await cardAnim.start({ rotateY: -90, scale: 0.88, filter: 'blur(3px)', transition: { duration: half, ease: 'easeIn' } });
        setDisplayedItem(item);
        setFlipKey((k) => k + 1);
        await cardAnim.start({ rotateY: 0, scale: 1, filter: 'blur(0px)', transition: { duration: half, ease: 'easeOut' } });
      } else {
        await cardAnim.start({ x: -60, opacity: 0, scale: 0.92, transition: { duration: half, ease: 'easeIn' } });
        setDisplayedItem(item);
        setFlipKey((k) => k + 1);
        await cardAnim.start({ x: 0, opacity: 1, scale: 1, transition: { duration: half, ease: 'easeOut' } });
      }
    }

    setChosen(winner);
    setPhase('result');
    spinningRef.current = false;
  }, [matches, cardAnim, screenAnim]);

  const { needsPermission, permissionGranted, requestPermission } = useShakeDetection({
    enabled: phase === 'idle' && isMobile,
    onShake: () => runSpin(true),
  });

  const { holding, holdFraction, startHold, finishHold, cancelHold } = useHoldButton({
    onComplete: () => runSpin(false),
  });

  function handleReset() {
    setChosen(null);
    setDisplayedItem(null);
    setPhase('idle');
  }

  return (
    <motion.div
      animate={screenAnim}
      className="relative flex min-h-screen flex-col bg-black select-none"
    >
      <AnimatePresence>
        {phase !== 'idle' && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background: phase === 'result'
                ? 'radial-gradient(ellipse 70% 50% at 50% 80%, rgba(255,46,166,0.18) 0%, transparent 70%)'
                : 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,46,166,0.10) 0%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      <div className="sticky top-0 z-30 flex items-center justify-between bg-black/80 px-4 py-4 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft size={18} />
          <span className="text-xs">Resultado</span>
        </button>
        <p className="text-[10px] uppercase tracking-[0.2em] text-pink-500">Sortear Match</p>
        <span className="text-xs text-white/30">{matches.length} matches</span>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <IdleView
            matches={matches}
            isMobile={isMobile}
            needsPermission={needsPermission}
            permissionGranted={permissionGranted}
            holding={holding}
            holdFraction={holdFraction}
            onRequestPermission={requestPermission}
            onStartHold={startHold}
            onFinishHold={finishHold}
            onCancelHold={cancelHold}
          />
        )}

        {phase === 'spinning' && (
          <SpinningView
            cardAnim={cardAnim}
            displayedItem={displayedItem}
            flipKey={flipKey}
            isMobile={isMobile}
          />
        )}

        {phase === 'result' && chosen && (
          <ResultView
            chosen={chosen}
            onBack={onBack}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
