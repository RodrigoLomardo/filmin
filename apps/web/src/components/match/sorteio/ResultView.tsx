import { motion } from 'framer-motion';
import { Film } from 'lucide-react';
import type { WatchItem } from '@/types/watch-item';

interface ResultViewProps {
  chosen: WatchItem;
  onBack: () => void;
  onReset: () => void;
}

export function ResultView({ chosen, onBack, onReset }: ResultViewProps) {
  return (
    <motion.div
      key="result"
      className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.p
        className="text-[10px] uppercase tracking-[0.3em] text-pink-500"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        É hoje!
      </motion.p>

      <motion.div
        className="relative w-52"
        initial={{ opacity: 0, scale: 0.6, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 18, delay: 0.12 }}
      >
        <div className="absolute inset-0 -z-10 scale-90 rounded-3xl bg-pink-500/30 blur-2xl" />
        <div className="aspect-[2/3] w-full overflow-hidden rounded-2xl bg-zinc-900 ring-2 ring-pink-500 shadow-2xl">
          {chosen.posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={chosen.posterUrl} alt={chosen.titulo} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Film size={48} className="text-white/15" />
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <p className="text-lg font-bold text-white leading-snug">{chosen.titulo}</p>
        {chosen.anoLancamento && (
          <p className="mt-0.5 text-sm text-white/40">{chosen.anoLancamento}</p>
        )}
      </motion.div>

      <motion.div
        className="w-full space-y-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={onReset}
          className="w-full rounded-full bg-pink-500 py-3.5 text-sm font-semibold text-white active:scale-95 transition-transform"
        >
          Sortear novamente
        </button>
        <button
          onClick={onBack}
          className="w-full rounded-full border border-white/15 py-3.5 text-sm font-semibold text-white/50 active:scale-95 transition-transform"
        >
          Ver resultado
        </button>
      </motion.div>
    </motion.div>
  );
}
