'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, ArrowLeft, Swords, X } from 'lucide-react';
import type { WatchItem } from '@/types/watch-item';

interface DebateSelectorProps {
  matches: WatchItem[];
  selectedIds: [string | null, string | null];
  onSelect: (id: string) => void;
  onConfirm: () => void;
  onBack: () => void;
}

function SlotCard({
  item,
  label,
  color,
  empty,
  onClear,
}: {
  item: WatchItem | undefined;
  label: 'A' | 'B';
  color: string;
  empty: boolean;
  onClear: () => void;
}) {
  return (
    <div className="relative flex-1">
      <AnimatePresence mode="wait">
        {empty ? (
          <motion.div
            key="empty"
            className="flex h-[130px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed"
            style={{ borderColor: `${color}30`, background: `${color}05` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <span
              className="text-4xl font-black leading-none tracking-tighter"
              style={{ color: `${color}30` }}
            >
              {label}
            </span>
            <span className="text-[10px] tracking-widest text-white/20 uppercase">
              escolher
            </span>
          </motion.div>
        ) : (
          <motion.div
            key={item?.id}
            className="relative h-[130px] overflow-hidden rounded-2xl"
            style={{
              border: `1.5px solid ${color}50`,
              background: `${color}08`,
            }}
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Poster strip on left */}
            <div className="absolute top-0 left-0 h-full w-[52px] overflow-hidden">
              {item?.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.posterUrl}
                  alt={item.titulo}
                  className="h-full w-full object-cover"
                  style={{ filter: 'brightness(0.7)' }}
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{ background: `${color}15` }}
                >
                  <Film size={16} style={{ color: `${color}60` }} />
                </div>
              )}
              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to right, transparent 60%, ${color}08 100%)`,
                }}
              />
            </div>

            {/* Content */}
            <div className="absolute inset-0 left-[52px] flex flex-col justify-between px-3 py-3">
              {/* Label badge */}
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color }}
                >
                  {label}
                </span>
                <button
                  onClick={onClear}
                  className="rounded-full p-0.5 transition-opacity hover:opacity-80"
                  style={{ color: `${color}60` }}
                >
                  <X size={12} />
                </button>
              </div>

              {/* Title */}
              <div>
                <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-white">
                  {item?.titulo}
                </p>
                {item?.anoLancamento && (
                  <p className="mt-0.5 text-[10px]" style={{ color: `${color}70` }}>
                    {item.anoLancamento}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DebateSelector({
  matches,
  selectedIds,
  onSelect,
  onConfirm,
  onBack,
}: DebateSelectorProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [idA, idB] = selectedIds;
  const canConfirm = idA !== null && idB !== null;

  const itemA = matches.find((m) => m.id === idA);
  const itemB = matches.find((m) => m.id === idB);

  function handleClear(side: 'A' | 'B') {
    const id = side === 'A' ? idA : idB;
    if (id) onSelect(id);
  }

  function getLabelFor(id: string): 'A' | 'B' | null {
    if (id === idA) return 'A';
    if (id === idB) return 'B';
    return null;
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#050505]">
      {/* ── Header ── */}
      <div className="flex shrink-0 items-center justify-between px-5 pt-12 pb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-white/30 transition-colors active:text-white"
        >
          <ArrowLeft size={15} />
          <span className="text-[12px]">Resultado</span>
        </button>
        <div className="text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#ff2ea6]">
            Debate
          </p>
          <p className="text-[8px] uppercase tracking-[0.2em] text-white/20">pelo Theo</p>
        </div>
        <span className="w-16" />
      </div>

      {/* ── Selection slots ── */}
      <div className="shrink-0 px-5">
        <div className="flex items-center gap-3">
          <SlotCard
            item={itemA}
            label="A"
            color="#ff2ea6"
            empty={!idA}
            onClear={() => handleClear('A')}
          />

          {/* VS divider */}
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <motion.div
              className="h-12 w-px"
              style={{
                background: canConfirm
                  ? 'linear-gradient(to bottom, #ff2ea6, #8b5cf6)'
                  : 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent)',
              }}
              animate={{ opacity: canConfirm ? [0.7, 1, 0.7] : 0.5 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.span
              className="text-[10px] font-black tracking-widest"
              style={{ color: canConfirm ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.12)' }}
              animate={canConfirm ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              vs
            </motion.span>
            <motion.div
              className="h-12 w-px"
              style={{
                background: canConfirm
                  ? 'linear-gradient(to bottom, #8b5cf6, #ff2ea6)'
                  : 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent)',
              }}
              animate={{ opacity: canConfirm ? [0.7, 1, 0.7] : 0.5 }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
          </div>

          <SlotCard
            item={itemB}
            label="B"
            color="#8b5cf6"
            empty={!idB}
            onClear={() => handleClear('B')}
          />
        </div>

        {/* Instruction */}
        <motion.p
          className="mt-3 text-center text-[10px] tracking-wide text-white/20"
          animate={{ opacity: canConfirm ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {!idA && !idB && 'Escolha dois filmes abaixo'}
          {idA && !idB && 'Agora escolha o segundo'}
          {canConfirm && ''}
        </motion.p>
      </div>

      {/* ── Separator ── */}
      <div className="mx-5 mt-5 mb-1 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/5" />
        <span className="text-[8px] uppercase tracking-[0.25em] text-white/15">
          {matches.length} matches
        </span>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      {/* ── Horizontal carousel ── */}
      <div
        ref={carouselRef}
        className="flex-1 overflow-x-auto overflow-y-hidden px-5 py-3"
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="flex h-full items-center gap-2.5" style={{ width: 'max-content' }}>
          {matches.map((item, i) => {
            const label = getLabelFor(item.id);
            const isSelected = label !== null;
            const colorSel = label === 'A' ? '#ff2ea6' : '#8b5cf6';

            return (
              <motion.button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="relative flex shrink-0 flex-col items-center gap-1.5"
                style={{ width: 56 }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                whileTap={{ scale: 0.93 }}
              >
                {/* Thumbnail */}
                <div
                  className="relative overflow-hidden rounded-xl"
                  style={{
                    width: 56,
                    height: 78,
                    border: isSelected ? `1.5px solid ${colorSel}` : '1.5px solid rgba(255,255,255,0.07)',
                    background: isSelected ? `${colorSel}10` : 'rgba(255,255,255,0.04)',
                  }}
                >
                  {item.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.posterUrl}
                      alt={item.titulo}
                      className="h-full w-full object-cover transition-all duration-200"
                      style={{ filter: isSelected ? 'brightness(0.6)' : 'brightness(0.85)' }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Film size={16} className="text-white/15" />
                    </div>
                  )}

                  {/* Selection badge */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{ duration: 0.18 }}
                      >
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-black text-white"
                          style={{ background: colorSel }}
                        >
                          {label}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Title */}
                <p
                  className="line-clamp-2 text-center leading-tight transition-colors duration-200"
                  style={{
                    fontSize: 9,
                    color: isSelected ? colorSel : 'rgba(255,255,255,0.35)',
                    maxWidth: 56,
                  }}
                >
                  {item.titulo}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="shrink-0 px-5 pb-10 pt-3">
        <motion.button
          onClick={onConfirm}
          disabled={!canConfirm}
          className="relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl py-4 text-[13px] font-bold tracking-wide text-white transition-all duration-300"
          style={{
            background: canConfirm
              ? 'linear-gradient(135deg, #ff2ea6 0%, #8b5cf6 100%)'
              : 'rgba(255,255,255,0.04)',
            border: canConfirm ? 'none' : '1px solid rgba(255,255,255,0.08)',
            color: canConfirm ? '#fff' : 'rgba(255,255,255,0.2)',
            boxShadow: canConfirm ? '0 0 32px rgba(255,46,166,0.25)' : 'none',
          }}
          whileTap={canConfirm ? { scale: 0.97 } : {}}
          animate={
            canConfirm
              ? { boxShadow: ['0 0 24px rgba(255,46,166,0.2)', '0 0 40px rgba(255,46,166,0.35)', '0 0 24px rgba(255,46,166,0.2)'] }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Swords size={15} />
          Iniciar Debate
        </motion.button>
      </div>
    </div>
  );
}
