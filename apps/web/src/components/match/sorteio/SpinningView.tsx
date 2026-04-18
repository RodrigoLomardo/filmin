import { motion, useAnimation } from 'framer-motion';
import { SpinCard } from '../SpinCard';
import type { WatchItem } from '@/types/watch-item';

interface SpinningViewProps {
  cardAnim: ReturnType<typeof useAnimation>;
  displayedItem: WatchItem | null;
  flipKey: number;
  isMobile: boolean;
}

export function SpinningView({ cardAnim, displayedItem, flipKey, isMobile }: SpinningViewProps) {
  return (
    <motion.div
      key="spinning"
      className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <motion.p
        className="text-[10px] uppercase tracking-[0.3em] text-pink-500/70"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        Sorteando...
      </motion.p>

      {!isMobile && (
        <motion.div
          className="absolute h-72 w-52 rounded-3xl border border-pink-500/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ borderStyle: 'dashed' }}
        />
      )}

      <motion.div animate={cardAnim} className="w-44" style={{ perspective: 800 }}>
        {displayedItem && <SpinCard key={flipKey} item={displayedItem} />}
      </motion.div>
    </motion.div>
  );
}
