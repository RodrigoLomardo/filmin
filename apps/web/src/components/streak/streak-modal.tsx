'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useSetStreakTipo } from '@/lib/hooks/use-streak';
import type { StreakTipo, Streak } from '@/types/streak';
import { StreakFire, FIRE_TIERS, getFireTheme, getTierLabel } from './streak-fire';
import { isFireActive } from '@/lib/streak-utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const TIPOS: { value: StreakTipo; label: string; desc: string; freq: string }[] = [
  { value: 'daily',   label: 'Diário',          desc: 'Pelo menos 1 atividade por dia', freq: '365×/ano' },
  { value: 'weekend', label: 'Fim de semana',    desc: 'Sex, Sábado ou Domingo',         freq: '52×/ano'  },
  { value: 'monthly', label: 'Mensal',           desc: 'Pelo menos 1 atividade por mês', freq: '12×/ano'  },
];

const TIPO_LABELS: Record<StreakTipo, string> = {
  daily:   'Foguinho Diário',
  weekend: 'Foguinho de Fim de Semana',
  monthly: 'Foguinho Mensal',
};

type PainelAtivo = 'tipo' | 'visuais' | null;

// ─── Confirmação de reset ─────────────────────────────────────────────────────

function ConfirmReset({
  tipoSelecionado,
  onConfirm,
  onCancel,
  isPending,
}: {
  tipoSelecionado: StreakTipo;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <motion.div
      className="flex flex-col gap-3"
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="rounded-2xl bg-amber-950/30 px-4 py-3.5 ring-1 ring-amber-500/20">
        <p className="text-sm font-semibold text-amber-400">Reset obrigatório</p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-400">
          Alterar para{' '}
          <span className="font-medium text-white">{TIPO_LABELS[tipoSelecionado]}</span>{' '}
          vai zerar sua sequência atual.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl bg-zinc-800 py-3 text-sm font-medium text-zinc-300 transition-colors active:bg-zinc-700"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={isPending}
          className="flex-1 rounded-xl bg-amber-500 py-3 text-sm font-semibold text-black transition-colors active:bg-amber-400 disabled:opacity-50"
        >
          {isPending ? 'Alterando…' : 'Confirmar'}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Painel: tipo de foguinho ─────────────────────────────────────────────────

function PainelTipo({
  tipoAtual,
  onSelect,
}: {
  tipoAtual: StreakTipo;
  onSelect: (t: StreakTipo) => void;
}) {
  return (
    <motion.div
      key="tipo"
      className="flex flex-col gap-2"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.07 } },
        exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
      }}
    >
      {TIPOS.map((t) => {
        const isAtual = t.value === tipoAtual;
        return (
          <motion.button
            key={t.value}
            onClick={() => !isAtual && onSelect(t.value)}
            disabled={isAtual}
            className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left transition-colors
              ${isAtual
                ? 'cursor-default bg-zinc-800/50 ring-1 ring-white/10'
                : 'bg-zinc-800/60 active:scale-[0.98] active:bg-zinc-700/60'
              }`}
            variants={{
              hidden: { opacity: 0, x: -14, scale: 0.97 },
              visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
              exit:   { opacity: 0, x: 10, scale: 0.97, transition: { duration: 0.16 } },
            }}
            whileTap={isAtual ? {} : { scale: 0.97 }}
          >
            <div>
              <div className="text-sm font-medium text-white">{t.label}</div>
              <div className="mt-0.5 text-xs text-zinc-500">{t.desc}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-600">{t.freq}</span>
              {isAtual && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-600">
                  <Check size={11} className="text-white" />
                </span>
              )}
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

// ─── Painel: visuais de progressão ───────────────────────────────────────────

function PainelVisuais({ sequenciaAtual }: { sequenciaAtual: number }) {
  return (
    <motion.div
      key="visuais"
      className="flex flex-col gap-1.5"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.065, delayChildren: 0.04 } },
        exit:   { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
      }}
    >
      {FIRE_TIERS.map((tier) => {
        const isAtual =
          sequenciaAtual >= tier.min &&
          (tier.max === null || sequenciaAtual <= tier.max);

        return (
          <motion.div
            key={tier.min}
            className="flex items-center gap-3 rounded-2xl px-3 py-3"
            style={
              isAtual
                ? {
                    background: `rgba(${tier.theme.glowRgb},0.09)`,
                    boxShadow: `0 0 0 1px rgba(${tier.theme.glowRgb},0.28)`,
                  }
                : { background: 'rgba(255,255,255,0.03)' }
            }
            variants={{
              hidden: { opacity: 0, y: 18, scale: 0.88, filter: 'blur(4px)' },
              visible: {
                opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
                transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
              },
              exit: {
                opacity: 0, y: -8, scale: 0.94,
                transition: { duration: 0.16 },
              },
            }}
          >
            {/* Fire icon with pop-in delay */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <StreakFire sequencia={tier.min === 0 ? 0 : tier.min} size={30} />
            </motion.div>

            <div className="flex-1">
              <div className="text-xs font-semibold text-white">{tier.label}</div>
              <div className="mt-0.5 text-[10px] text-zinc-500">
                {tier.max === null
                  ? `${tier.min}+ sequências`
                  : tier.min === 0
                  ? 'Nenhuma sequência ativa'
                  : `${tier.min} – ${tier.max} sequências`}
              </div>
            </div>

            {isAtual && (
              <motion.div
                className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{
                  color: tier.theme.outer,
                  background: `rgba(${tier.theme.glowRgb},0.15)`,
                }}
                animate={{ opacity: [0.65, 1, 0.65] }}
                transition={{ duration: 2.2, repeat: Infinity }}
              >
                você
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ─── Botões de painel ─────────────────────────────────────────────────────────

function PainelBtn({
  label,
  ativo,
  onClick,
  glowRgb,
}: {
  label: string;
  ativo: boolean;
  onClick: () => void;
  glowRgb: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="relative flex-1 rounded-xl py-2.5 text-xs font-semibold transition-colors"
      style={
        ativo
          ? {
              color: '#fff',
              background: `rgba(${glowRgb},0.14)`,
              boxShadow: `0 0 0 1px rgba(${glowRgb},0.3)`,
            }
          : { color: '#71717a', background: 'rgba(255,255,255,0.04)' }
      }
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.15 }}
    >
      {label}
    </motion.button>
  );
}

// ─── Modal principal ──────────────────────────────────────────────────────────

interface StreakModalProps {
  open: boolean;
  onClose: () => void;
  streak: Streak;
}

export function StreakModal({ open, onClose, streak }: StreakModalProps) {
  const [painel, setPainel] = useState<PainelAtivo>(null);
  const [tipoSelecionado, setTipoSelecionado] = useState<StreakTipo | null>(null);
  const { mutate, isPending } = useSetStreakTipo();

  const theme = getFireTheme(streak.sequenciaAtual);
  const tierLabel = getTierLabel(streak.sequenciaAtual);
  const active = isFireActive(streak);

  function togglePainel(p: PainelAtivo) {
    setTipoSelecionado(null);
    setPainel((prev) => (prev === p ? null : p));
  }

  function handleSelectTipo(tipo: StreakTipo) {
    setTipoSelecionado(tipo);
  }

  function handleConfirm() {
    if (!tipoSelecionado) return;
    mutate(tipoSelecionado, {
      onSuccess: () => {
        setTipoSelecionado(null);
        setPainel(null);
        onClose();
      },
    });
  }

  function handleClose() {
    setPainel(null);
    setTipoSelecionado(null);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
          />

          {/* Bottom sheet */}
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center sm:inset-0 sm:items-center sm:px-4">
            <motion.div
              className="pointer-events-auto w-full max-w-md overflow-hidden rounded-t-3xl bg-[#0d0d0f] pb-safe sm:rounded-3xl"
              style={{
                boxShadow: `0 -24px 80px -8px rgba(${theme.glowRgb},0.2), 0 0 0 1px rgba(255,255,255,0.06)`,
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 360, mass: 0.85 }}
            >
              {/* Handle */}
              <div className="flex justify-center pb-1 pt-3 sm:hidden">
                <div className="h-1 w-10 rounded-full bg-zinc-700/80" />
              </div>

              <div className="px-5 pb-8 pt-4">
                {/* Close */}
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={handleClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-500 transition-colors hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Fire hero */}
                <div className="mb-6 flex flex-col items-center gap-2.5">
                  <StreakFire sequencia={streak.sequenciaAtual} isActive={active} size={68} />

                  <div className="text-center">
                    <motion.div
                      key={streak.sequenciaAtual}
                      className="text-5xl font-bold tabular-nums text-white"
                      initial={{ scale: 0.75, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 12, stiffness: 280 }}
                    >
                      {streak.sequenciaAtual}
                    </motion.div>

                    <p className="mt-1 text-sm text-zinc-500">{TIPO_LABELS[streak.tipo]}</p>

                    {tierLabel && (
                      <motion.span
                        className="mt-2 inline-block rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                        style={{
                          color: theme.outer,
                          background: `rgba(${theme.glowRgb},0.12)`,
                          border: `1px solid rgba(${theme.glowRgb},0.28)`,
                        }}
                        animate={{ opacity: [0.75, 1, 0.75] }}
                        transition={{ duration: 2.8, repeat: Infinity }}
                      >
                        {tierLabel}
                      </motion.span>
                    )}
                  </div>
                </div>

                {/* Painel toggle buttons */}
                <div className="mb-4 flex gap-2">
                  <PainelBtn
                    label="Tipo de foguinho"
                    ativo={painel === 'tipo'}
                    onClick={() => togglePainel('tipo')}
                    glowRgb={theme.glowRgb}
                  />
                  <PainelBtn
                    label="Visuais"
                    ativo={painel === 'visuais'}
                    onClick={() => togglePainel('visuais')}
                    glowRgb={theme.glowRgb}
                  />
                </div>

                {/* Painel content — animated swap */}
                <AnimatePresence mode="wait">
                  {tipoSelecionado ? (
                    <ConfirmReset
                      key="confirm"
                      tipoSelecionado={tipoSelecionado}
                      onConfirm={handleConfirm}
                      onCancel={() => setTipoSelecionado(null)}
                      isPending={isPending}
                    />
                  ) : painel === 'tipo' ? (
                    <PainelTipo
                      key="tipo"
                      tipoAtual={streak.tipo}
                      onSelect={handleSelectTipo}
                    />
                  ) : painel === 'visuais' ? (
                    <PainelVisuais
                      key="visuais"
                      sequenciaAtual={streak.sequenciaAtual}
                    />
                  ) : null}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
