import { motion } from 'framer-motion';
import Link from 'next/link';
import { Film, Shuffle } from 'lucide-react';
import type { WatchItem } from '@/types/watch-item';

interface ResultScreenProps {
  matches: WatchItem[];
  onRestart: () => void;
  onSortear?: () => void;
}

export function ResultScreen({ matches, onRestart, onSortear }: ResultScreenProps) {
  return (
    <motion.div
      className="flex h-screen flex-col bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex-shrink-0 px-6 pb-6 pt-14 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-pink-500">Modo Match</p>
        <h2 className="mt-2 text-3xl font-bold text-white">Resultado</h2>
        <p className="mt-1 text-sm text-white/40">
          {matches.length === 0
            ? 'Nenhum match desta sessão.'
            : `${matches.length} match${matches.length !== 1 ? 'es' : ''} nesta sessão`}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {matches.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-sm text-white/25">
              Vocês não concordaram em nenhum item.
              <br />
              Que tal tentar de novo?
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((item, i) => (
              <motion.div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
              >
                <div className="h-16 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                  {item.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.posterUrl} alt={item.titulo} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Film size={20} className="text-white/20" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{item.titulo}</p>
                  <p className="text-xs text-white/40">{item.anoLancamento}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 space-y-3 px-6 pb-10">
        {onSortear && (
          <motion.button
            onClick={onSortear}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-pink-500 py-3.5 text-sm font-semibold text-white"
            whileTap={{ scale: 0.96 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: matches.length * 0.08 + 0.1 }}
          >
            <Shuffle size={16} />
            Sortear entre os matches
          </motion.button>
        )}
        <motion.button
          onClick={onRestart}
          className={`w-full rounded-full py-3.5 text-sm font-semibold ${
            onSortear ? 'border border-white/15 text-white/50' : 'bg-pink-500 text-white'
          }`}
          whileTap={{ scale: 0.96 }}
        >
          Jogar novamente
        </motion.button>
        <Link
          href="/"
          className="block w-full rounded-full border border-white/10 py-3.5 text-center text-sm font-semibold text-white/30"
        >
          Início
        </Link>
      </div>
    </motion.div>
  );
}
