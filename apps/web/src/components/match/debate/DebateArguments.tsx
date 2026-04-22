'use client';

import { motion } from 'framer-motion';

interface DebateArgumentsProps {
  argumentsForA: string[];
  argumentsForB: string[];
}

function ArgumentBubble({
  text,
  roundIndex,
  side,
}: {
  text: string;
  roundIndex: number;
  side: 'A' | 'B';
}) {
  const isA = side === 'A';
  const color = isA ? '#ff2ea6' : '#8b5cf6';

  return (
    <motion.div
      className="flex flex-col gap-1"
      style={{ alignItems: isA ? 'flex-start' : 'flex-end' }}
      initial={{ opacity: 0, x: isA ? -16 : 16, y: 6 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: 0.35,
        delay: roundIndex * 0.22 + (isA ? 0 : 0.11),
        ease: [0.32, 0.72, 0, 1],
      }}
    >
      {/* Side tag */}
      <div
        className="flex items-center gap-1.5 px-1"
        style={{ flexDirection: isA ? 'row' : 'row-reverse' }}
      >
        <span
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-black text-white"
          style={{ background: color }}
        >
          {side}
        </span>
        <span className="text-[9px] uppercase tracking-widest" style={{ color: `${color}60` }}>
          argumento {roundIndex + 1}
        </span>
      </div>

      {/* Bubble */}
      <div
        className="max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed"
        style={{
          background: `${color}08`,
          border: `1px solid ${color}18`,
          color: 'rgba(255,255,255,0.75)',
          borderTopLeftRadius: isA ? 4 : undefined,
          borderTopRightRadius: isA ? undefined : 4,
        }}
      >
        {text}
      </div>
    </motion.div>
  );
}

export function DebateArguments({ argumentsForA, argumentsForB }: DebateArgumentsProps) {
  const maxRounds = Math.max(argumentsForA.length, argumentsForB.length);

  return (
    <div className="px-4 pt-5">
      {/* Section label */}
      <motion.div
        className="mb-4 flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="h-px flex-1 bg-white/5" />
        <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/20">
          Rodadas
        </span>
        <div className="h-px flex-1 bg-white/5" />
      </motion.div>

      {/* Interleaved argument bubbles */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: maxRounds }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            {argumentsForA[i] && (
              <ArgumentBubble text={argumentsForA[i]} roundIndex={i} side="A" />
            )}
            {argumentsForB[i] && (
              <ArgumentBubble text={argumentsForB[i]} roundIndex={i} side="B" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
