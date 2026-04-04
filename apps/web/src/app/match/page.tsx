'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Heart, X, Film, Shuffle, Mouse, Smartphone } from 'lucide-react';
import { getMatchPool } from '@/lib/api/watch-items';
import type { WatchItem } from '@/types/watch-item';

type Vote = boolean | null;

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function MatchPage() {
  const { data: pool = [], isLoading, isError } = useQuery({
    queryKey: ['match-pool'],
    queryFn: getMatchPool,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [votoEle, setVotoEle] = useState<Vote>(null);
  const [votoEla, setVotoEla] = useState<Vote>(null);
  const [matchesDaSessao, setMatchesDaSessao] = useState<WatchItem[]>([]);
  const [showSorteio, setShowSorteio] = useState(false);

  const currentItem = pool[currentIndex];
  const isFinished = pool.length > 0 && currentIndex >= pool.length;

  useEffect(() => {
    if (votoEle === null || votoEla === null) return;

    if (votoEle && votoEla && currentItem) {
      setMatchesDaSessao((prev) => [...prev, currentItem]);
    }

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setVotoEle(null);
      setVotoEla(null);
    }, 650);

    return () => clearTimeout(timer);
  }, [votoEle, votoEla, currentItem]);

  function handleRestart() {
    setCurrentIndex(0);
    setMatchesDaSessao([]);
    setVotoEle(null);
    setVotoEla(null);
    setShowSorteio(false);
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <motion.div
          className="h-8 w-8 rounded-full border-2 border-pink-500 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center">
        <p className="text-sm text-white/60">Erro ao carregar os itens.</p>
        <Link href="/" className="text-sm text-pink-500 underline">
          Voltar ao início
        </Link>
      </div>
    );
  }

  if (pool.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-pink-500">
          Modo Match
        </p>

        <p className="text-sm text-white/60">
          Nenhum item na lista &quot;Quero Assistir&quot;.
        </p>

        <Link
          href="/cadastro"
          className="mt-2 rounded-full bg-pink-500 px-6 py-2.5 text-sm font-semibold text-white"
        >
          Adicionar itens
        </Link>

        <Link
          href="/"
          className="rounded-full border border-zinc-700 px-6 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
        >
          Voltar ao início
        </Link>
      </div>
    );
  }

  if (isFinished && showSorteio) {
    return (
      <SorteioMatchScreen
        matches={matchesDaSessao}
        onBack={() => setShowSorteio(false)}
      />
    );
  }

  if (isFinished) {
    return (
      <ResultScreen
        matches={matchesDaSessao}
        onRestart={handleRestart}
        onSortear={matchesDaSessao.length > 1 ? () => setShowSorteio(true) : undefined}
      />
    );
  }

  const isMatch = votoEle === true && votoEla === true;

  return (
    <div className="relative h-screen overflow-hidden bg-black select-none">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft size={18} />
          <span className="text-xs">Voltar</span>
        </Link>
        <p className="text-[10px] uppercase tracking-[0.2em] text-pink-500">Modo Match</p>
        <p className="text-xs text-white/30">
          {currentIndex + 1}/{pool.length}
        </p>
      </div>

      {/* Left half — Ele */}
      <div className="absolute top-0 left-0 h-full w-1/2">
        <AnimatePresence>
          {votoEle !== null && (
            <motion.div
              key={`overlay-ele-${currentIndex}`}
              className={`absolute inset-0 ${votoEle ? 'bg-green-500' : 'bg-red-500'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.18 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        <div className="absolute top-16 left-0 right-0 text-center">
          <p className="text-[10px] uppercase tracking-widest text-white/25">Ele</p>
        </div>

        <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-3">
          <VoteButton
            variant="no"
            active={votoEle === false}
            disabled={votoEle !== null}
            onClick={() => setVotoEle(false)}
          />
          <VoteButton
            variant="yes"
            active={votoEle === true}
            disabled={votoEle !== null}
            onClick={() => setVotoEle(true)}
          />
        </div>
      </div>

      {/* Right half — Ela */}
      <div className="absolute top-0 right-0 h-full w-1/2">
        <AnimatePresence>
          {votoEla !== null && (
            <motion.div
              key={`overlay-ela-${currentIndex}`}
              className={`absolute inset-0 ${votoEla ? 'bg-green-500' : 'bg-red-500'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.18 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        <div className="absolute top-16 left-0 right-0 text-center">
          <p className="text-[10px] uppercase tracking-widest text-white/25">Ela</p>
        </div>

        <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-3">
          <VoteButton
            variant="no"
            active={votoEla === false}
            disabled={votoEla !== null}
            onClick={() => setVotoEla(false)}
          />
          <VoteButton
            variant="yes"
            active={votoEla === true}
            disabled={votoEla !== null}
            onClick={() => setVotoEla(true)}
          />
        </div>
      </div>

      {/* Center divider */}
      <div className="absolute top-0 bottom-0 left-1/2 z-20 w-px -translate-x-1/2 bg-white/10" />

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          className="absolute top-1/2 left-1/2 z-20 w-44 -translate-x-1/2 -translate-y-[55%]"
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: -24 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          <div
            className={`relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl transition-all duration-300 ${isMatch ? 'ring-2 ring-green-400' : 'ring-1 ring-white/10'
              }`}
          >
            {currentItem.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentItem.posterUrl}
                alt={currentItem.titulo}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Film size={40} className="text-white/15" />
              </div>
            )}

            <AnimatePresence>
              {isMatch && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-black/40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="rounded-full bg-green-500 px-4 py-1.5">
                    <p className="text-xs font-bold uppercase tracking-widest text-white">
                      Match
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-2.5 text-center">
            <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">
              {currentItem.titulo}
            </p>
            <p className="mt-0.5 text-[11px] text-white/35">{currentItem.anoLancamento}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── VoteButton ───────────────────────────────────────────────────────────────

function VoteButton({
  variant,
  active,
  disabled,
  onClick,
}: {
  variant: 'yes' | 'no';
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const isYes = variant === 'yes';

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors duration-200 ${active
          ? isYes
            ? 'border-green-400 bg-green-500 text-white'
            : 'border-red-400 bg-red-500 text-white'
          : disabled
            ? 'cursor-not-allowed border-white/10 bg-white/5 text-white/20'
            : isYes
              ? 'border-white/20 bg-white/5 text-white/50 hover:border-green-400/50 hover:text-green-400'
              : 'border-white/20 bg-white/5 text-white/50 hover:border-red-400/50 hover:text-red-400'
        }`}
      whileTap={!disabled ? { scale: 0.85 } : {}}
      whileHover={!disabled && !active ? { scale: 1.08 } : {}}
    >
      {isYes ? <Heart size={18} /> : <X size={18} />}
    </motion.button>
  );
}

// ─── ResultScreen ─────────────────────────────────────────────────────────────

function ResultScreen({
  matches,
  onRestart,
  onSortear,
}: {
  matches: WatchItem[];
  onRestart: () => void;
  onSortear?: () => void;
}) {
  return (
    <motion.div
      className="flex h-screen flex-col bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-6 pb-6 pt-14 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-pink-500">Modo Match</p>
        <h2 className="mt-2 text-3xl font-bold text-white">Resultado</h2>
        <p className="mt-1 text-sm text-white/40">
          {matches.length === 0
            ? 'Nenhum match desta sessão.'
            : `${matches.length} match${matches.length !== 1 ? 'es' : ''} nesta sessão`}
        </p>
      </div>

      {/* Matches list */}
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
                    <img
                      src={item.posterUrl}
                      alt={item.titulo}
                      className="h-full w-full object-cover"
                    />
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

      {/* Actions */}
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
          className={`w-full rounded-full py-3.5 text-sm font-semibold ${onSortear
              ? 'border border-white/15 text-white/50'
              : 'bg-pink-500 text-white'
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

// ─── SpinCard ─────────────────────────────────────────────────────────────────

function SpinCard({ item }: { item: WatchItem }) {
  return (
    <motion.div
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.06 }}
    >
      <div className="aspect-[2/3] w-full overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/10 shadow-xl">
        {item.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.posterUrl} alt={item.titulo} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-3">
            <Film size={32} className="text-white/15" />
            <p className="text-center text-xs font-medium leading-tight text-white/40 line-clamp-3">
              {item.titulo}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── SorteioMatchScreen ───────────────────────────────────────────────────────

type SpinPhase = 'idle' | 'spinning' | 'result';

function SorteioMatchScreen({
  matches,
  onBack,
}: {
  matches: WatchItem[];
  onBack: () => void;
}) {
  // Responsive detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // State
  const [phase, setPhase] = useState<SpinPhase>('idle');
  const [chosen, setChosen] = useState<WatchItem | null>(null);
  const [displayedItem, setDisplayedItem] = useState<WatchItem | null>(null);
  const [flipKey, setFlipKey] = useState(0);
  const spinningRef = useRef(false);

  // Animations
  const cardAnim = useAnimation();
  const screenAnim = useAnimation();

  // Core spin sequence
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
        await cardAnim.start({
          rotateY: -90,
          scale: 0.88,
          filter: 'blur(3px)',
          transition: { duration: half, ease: 'easeIn' },
        });
        setDisplayedItem(item);
        setFlipKey((k) => k + 1);
        await cardAnim.start({
          rotateY: 0,
          scale: 1,
          filter: 'blur(0px)',
          transition: { duration: half, ease: 'easeOut' },
        });
      } else {
        await cardAnim.start({
          x: -60,
          opacity: 0,
          scale: 0.92,
          transition: { duration: half, ease: 'easeIn' },
        });
        setDisplayedItem(item);
        setFlipKey((k) => k + 1);
        await cardAnim.start({
          x: 0,
          opacity: 1,
          scale: 1,
          transition: { duration: half, ease: 'easeOut' },
        });
      }
    }

    setChosen(winner);
    setPhase('result');
    spinningRef.current = false;
  }, [matches, cardAnim, screenAnim]);

  // Mobile shake detection
  const shakeRef = useRef({ lastX: 0, lastY: 0, lastZ: 0, lastTime: 0, count: 0, timer: 0 as unknown as ReturnType<typeof setTimeout> });

  useEffect(() => {
    if (phase !== 'idle' || !isMobile) return;

    function onMotion(e: DeviceMotionEvent) {
      const acc = e.accelerationIncludingGravity;
      if (!acc || acc.x == null) return;

      const now = Date.now();
      const s = shakeRef.current;
      if (now - s.lastTime < 80) return;
      s.lastTime = now;

      const dx = Math.abs((acc.x ?? 0) - s.lastX);
      const dy = Math.abs((acc.y ?? 0) - s.lastY);
      const dz = Math.abs((acc.z ?? 0) - s.lastZ);
      s.lastX = acc.x ?? 0;
      s.lastY = acc.y ?? 0;
      s.lastZ = acc.z ?? 0;

      if (dx + dy + dz > 25) {
        s.count++;
        clearTimeout(s.timer);
        s.timer = setTimeout(() => { s.count = 0; }, 700);
        if (s.count >= 3) {
          s.count = 0;
          runSpin(true);
        }
      }
    }

    const DME = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof DME.requestPermission !== 'function') {
      window.addEventListener('devicemotion', onMotion);
    }

    return () => window.removeEventListener('devicemotion', onMotion);
  }, [phase, isMobile, runSpin]);

  // iOS permission
  const [needsPermission, setNeedsPermission] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    const DME = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> };
    setNeedsPermission(typeof DME.requestPermission === 'function');
  }, []);

  async function requestMotionPermission() {
    const DME = DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> };
    const result = await DME.requestPermission();
    if (result === 'granted') setPermissionGranted(true);
  }

  // Desktop hold button
  const [holding, setHolding] = useState(false);
  const [holdFraction, setHoldFraction] = useState(0);
  const holdRafRef = useRef<number>(0);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdStartRef = useRef(0);
  const HOLD_DURATION = 1400;

  function startHold() {
    if (matches.length === 0 || holding) return;
    setHolding(true);
    holdStartRef.current = Date.now();

    function tick() {
      const elapsed = Date.now() - holdStartRef.current;
      const frac = Math.min(elapsed / HOLD_DURATION, 1);
      setHoldFraction(frac);
      if (frac < 1) {
        holdRafRef.current = requestAnimationFrame(tick);
      } else {
        finishHold();
      }
    }
    holdRafRef.current = requestAnimationFrame(tick);
  }

  function finishHold() {
    setHolding(false);
    setHoldFraction(0);
    cancelAnimationFrame(holdRafRef.current);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    runSpin(false);
  }

  function cancelHold() {
    if (!holding) return;
    setHolding(false);
    setHoldFraction(0);
    cancelAnimationFrame(holdRafRef.current);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
  }

  const R = 58;
  const CIRC = 2 * Math.PI * R;

  return (
    <motion.div
      animate={screenAnim}
      className="relative flex min-h-screen flex-col bg-black select-none"
    >
      {/* Ambient background */}
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

      {/* Header */}
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

      {/* ── IDLE ──────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.div
            key="idle"
            className="relative z-10 flex flex-1 flex-col px-5 pb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
            transition={{ duration: 0.35 }}
          >
            {/* Presentation */}
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

            {/* How to use */}
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

                <motion.button
                  onClick={() => runSpin(true)}
                  disabled={phase !== 'idle'}
                  className="w-full rounded-2xl border border-dashed border-pink-500/30 py-3.5 text-sm font-medium text-pink-400/70 transition active:scale-95 disabled:opacity-30"
                  whileTap={{ scale: 0.97 }}
                >
                  Simular sacudida
                </motion.button>

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
                      onClick={requestMotionPermission}
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
                    className={`relative z-10 flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-full transition-colors duration-200 ${holding
                        ? 'bg-pink-500/20 text-pink-400'
                        : 'bg-zinc-900 text-white/60 hover:bg-zinc-800 hover:text-white/80'
                      }`}
                    onMouseDown={startHold}
                    onMouseUp={holding ? finishHold : undefined}
                    onMouseLeave={cancelHold}
                    onTouchStart={startHold}
                    onTouchEnd={holding ? finishHold : undefined}
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

            {/* Matches grid preview */}
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
        )}

        {/* ── SPINNING ── */}
        {phase === 'spinning' && (
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

            <motion.div
              animate={cardAnim}
              className="w-44"
              style={{ perspective: 800 }}
            >
              {displayedItem && <SpinCard key={flipKey} item={displayedItem} />}
            </motion.div>
          </motion.div>
        )}

        {/* ── RESULT ── */}
        {phase === 'result' && chosen && (
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
                onClick={() => { setChosen(null); setDisplayedItem(null); setPhase('idle'); }}
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
        )}
      </AnimatePresence>
    </motion.div>
  );
}
