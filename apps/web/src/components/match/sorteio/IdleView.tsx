import { motion } from 'framer-motion';
import { Film, Mouse, Shuffle, Smartphone } from 'lucide-react';
import type { WatchItem } from '@/types/watch-item';

interface IdleViewProps {
  matches: WatchItem[];
  isMobile: boolean;
  needsPermission: boolean;
  permissionGranted: boolean;
  holding: boolean;
  holdFraction: number;
  onRequestPermission: () => void;
  onStartHold: () => void;
  onFinishHold: () => void;
  onCancelHold: () => void;
}

const R = 58;
const CIRC = 2 * Math.PI * R;

export function IdleView({
  matches,
  isMobile,
  needsPermission,
  permissionGranted,
  holding,
  holdFraction,
  onRequestPermission,
  onStartHold,
  onFinishHold,
  onCancelHold,
}: IdleViewProps) {
  return (
    <motion.div
      key="idle"
      className="relative z-10 flex flex-1 flex-col px-5 pb-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35 }}
    >
      {/* Header presentation */}
      <div className="flex flex-col items-center gap-3 py-10">
        <motion.div
          className="relative flex h-20 w-20 items-center justify-center"
          animate={{ rotate: [0, 8, -8, 4, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
        >
          <div className="absolute inset-0 rounded-full bg-pink-500/15 blur-xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 ring-1 ring-pink-500/30">
            <Shuffle size={32} className="text-pink-500" />
          </div>
        </motion.div>

        <div className="text-center">
          <h2 className="text-xl font-bold text-white">Sortear entre os Matches</h2>
          <p className="mt-1.5 max-w-xs text-sm text-white/50 leading-relaxed">
            Vocês tiveram {matches.length} matches! Deixa a sorte decidir qual assistir hoje.
          </p>
        </div>
      </div>

      {/* Interaction hint */}
      {isMobile ? (
        <div className="flex flex-col gap-3">
          <motion.div
            className="flex items-center gap-4 rounded-2xl border border-pink-500/20 bg-pink-500/5 px-5 py-5"
            animate={{ borderColor: ['rgba(255,46,166,0.2)', 'rgba(255,46,166,0.5)', 'rgba(255,46,166,0.2)'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div
              animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }}
            >
              <Smartphone size={28} className="flex-shrink-0 text-pink-400" />
            </motion.div>
            <div>
              <p className="font-semibold text-white">Sacuda o celular</p>
              <p className="mt-0.5 text-xs text-white/50 leading-relaxed">
                Balance o aparelho 3× seguidas para sortear entre os matches
              </p>
            </div>
          </motion.div>

          {needsPermission && !permissionGranted && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 px-5 py-4"
            >
              <p className="text-xs text-yellow-400/80 mb-3">
                iOS precisa de permissão para detectar o movimento do aparelho.
              </p>
              <button
                onClick={onRequestPermission}
                className="rounded-full bg-yellow-500 px-4 py-1.5 text-xs font-semibold text-black"
              >
                Permitir sensor de movimento
              </button>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/4 px-5 py-4 w-full max-w-sm">
            <Mouse size={22} className="flex-shrink-0 text-pink-400" />
            <div>
              <p className="font-semibold text-white text-sm">Pressione e segure</p>
              <p className="mt-0.5 text-xs text-white/50">
                Mantenha o botão pressionado até o círculo completar
              </p>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <svg width="140" height="140" className="absolute" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
              <circle
                cx="70" cy="70" r={R}
                fill="none"
                stroke="#ff2ea6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC * (1 - holdFraction)}
                style={{ transition: holding ? 'none' : 'stroke-dashoffset 0.3s ease' }}
              />
            </svg>

            <button
              className={`relative z-10 flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-full transition-colors duration-200 ${
                holding
                  ? 'bg-pink-500/20 text-pink-400'
                  : 'bg-zinc-900 text-white/60 hover:bg-zinc-800 hover:text-white/80'
              }`}
              onMouseDown={onStartHold}
              onMouseUp={holding ? onFinishHold : undefined}
              onMouseLeave={onCancelHold}
              onTouchStart={onStartHold}
              onTouchEnd={holding ? onFinishHold : undefined}
            >
              <motion.div
                animate={holding ? { rotate: 360 } : { rotate: 0 }}
                transition={holding ? { duration: 1.4, ease: 'linear', repeat: Infinity } : {}}
              >
                <Shuffle size={24} />
              </motion.div>
              <span className="text-[10px] font-medium tracking-wide">
                {holding ? 'Sorteando' : 'Segurar'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Matches preview */}
      <div className="mt-8">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
          Seus matches
        </p>
        <div
          className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5"
          style={{ scrollbarWidth: 'none' }}
        >
          {matches.map((item, i) => (
            <motion.div
              key={item.id}
              className="flex-shrink-0 w-20"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.06, duration: 0.3 }}
            >
              <div className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-pink-500/30">
                {item.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.posterUrl} alt={item.titulo} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Film size={18} className="text-white/15" />
                  </div>
                )}
              </div>
              <p className="mt-1.5 line-clamp-2 text-center text-[10px] leading-tight text-white/40">
                {item.titulo}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
