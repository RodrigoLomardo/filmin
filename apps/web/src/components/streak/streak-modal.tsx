'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, RefreshCw } from 'lucide-react';
import { useSetStreakTipo } from '@/lib/hooks/use-streak';
import type { StreakTipo, Streak } from '@/types/streak';
import { StreakFire, FIRE_TIERS, getFireTheme, getTierLabel } from './streak-fire';

// ─── Tipo option data ─────────────────────────────────────────────────────────

const TIPOS: { value: StreakTipo; label: string; desc: string; freq: string }[] = [
  { value: 'daily', label: 'Diário', desc: 'Pelo menos 1 atividade por dia', freq: '365×/ano' },
  { value: 'weekend', label: 'Fim de semana', desc: 'Sex, Sábado ou Domingo', freq: '52×/ano' },
  { value: 'monthly', label: 'Mensal', desc: 'Pelo menos 1 atividade por mês', freq: '12×/ano' },
];

const TIPO_LABELS: Record<StreakTipo, string> = {
  daily: 'Foguinho Diário',
  weekend: 'Foguinho de Fim de Semana',
  monthly: 'Foguinho Mensal',
};

// ─── Animated "alterar" shimmer text ─────────────────────────────────────────

function AlterarText({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-1.5 text-[11px] text-zinc-500 transition-colors hover:text-zinc-300"
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <RefreshCw size={10} />
      </motion.span>
      alterar tipo de foguinho
    </motion.button>
  );
}

// ─── Confirmation dialog for reset warning ────────────────────────────────────

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
      className="flex flex-col gap-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <div className="rounded-2xl bg-amber-950/30 p-4 ring-1 ring-amber-500/20">
        <p className="text-sm font-medium text-amber-400">Atenção: reset obrigatório</p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-400">
          Alterar para <span className="text-white">{TIPO_LABELS[tipoSelecionado]}</span> vai
          zerar sua sequência atual. Essa ação não pode ser desfeita.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl bg-zinc-800 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={isPending}
          className="flex-1 rounded-xl bg-amber-500 py-3 text-sm font-semibold text-black transition-colors hover:bg-amber-400 disabled:opacity-50"
        >
          {isPending ? 'Alterando…' : 'Confirmar reset'}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

interface StreakModalProps {
  open: boolean;
  onClose: () => void;
  streak: Streak;
}

export function StreakModal({ open, onClose, streak }: StreakModalProps) {
  const [showAlteracao, setShowAlteracao] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState<StreakTipo | null>(null);
  const { mutate, isPending } = useSetStreakTipo();

  const theme = getFireTheme(streak.sequenciaAtual);
  const tierLabel = getTierLabel(streak.sequenciaAtual);

  function handleSelectTipo(tipo: StreakTipo) {
    if (tipo === streak.tipo) return;
    setTipoSelecionado(tipo);
  }

  function handleConfirm() {
    if (!tipoSelecionado) return;
    mutate(tipoSelecionado, {
      onSuccess: () => {
        setTipoSelecionado(null);
        setShowAlteracao(false);
        onClose();
      },
    });
  }

  function handleClose() {
    setShowAlteracao(false);
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
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-0 sm:items-center sm:inset-0 sm:px-4">
            <motion.div
              className="pointer-events-auto w-full max-w-md overflow-hidden rounded-t-3xl bg-[#0d0d0f] pb-safe sm:rounded-3xl sm:mb-0"
              style={{ boxShadow: `0 -20px 80px -10px rgba(${theme.glowRgb},0.18), 0 0 0 1px rgba(255,255,255,0.06)` }}
              initial={{ y: '100%', opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 340, mass: 0.9 }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="h-1 w-10 rounded-full bg-zinc-700" />
              </div>

              <div className="p-6 pb-8">
                {/* Header row */}
                <div className="mb-5 flex items-start justify-between">
                  <div />
                  <button
                    onClick={handleClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-colors hover:text-white"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Fire + current info */}
                <div className="mb-6 flex flex-col items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <StreakFire sequencia={streak.sequenciaAtual} size={64} />
                  </motion.div>

                  <div className="text-center">
                    <motion.div
                      key={streak.sequenciaAtual}
                      className="text-4xl font-bold tabular-nums text-white"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 14, stiffness: 300 }}
                    >
                      {streak.sequenciaAtual}
                    </motion.div>
                    <div className="mt-0.5 text-sm text-zinc-400">{TIPO_LABELS[streak.tipo]}</div>
                    {tierLabel && (
                      <div
                        className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                        style={{
                          color: theme.outer,
                          background: `rgba(${theme.glowRgb},0.12)`,
                          border: `1px solid rgba(${theme.glowRgb},0.25)`,
                        }}
                      >
                        {tierLabel}
                      </div>
                    )}
                  </div>

                  {!showAlteracao && (
                    <AlterarText onClick={() => setShowAlteracao(true)} />
                  )}
                </div>

                {/* Alterar tipo section */}
                <AnimatePresence mode="wait">
                  {tipoSelecionado ? (
                    <ConfirmReset
                      key="confirm"
                      tipoSelecionado={tipoSelecionado}
                      onConfirm={handleConfirm}
                      onCancel={() => setTipoSelecionado(null)}
                      isPending={isPending}
                    />
                  ) : showAlteracao ? (
                    <motion.div
                      key="tipos"
                      className="flex flex-col gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.22 }}
                    >
                      <p className="mb-1 text-xs font-medium uppercase tracking-widest text-zinc-500">
                        Alterar para
                      </p>
                      {TIPOS.map((t, i) => {
                        const isAtual = t.value === streak.tipo;
                        return (
                          <motion.button
                            key={t.value}
                            onClick={() => handleSelectTipo(t.value)}
                            disabled={isAtual}
                            className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left transition-colors ${
                              isAtual
                                ? 'cursor-default bg-zinc-800/40 ring-1 ring-white/10'
                                : 'bg-zinc-800/60 hover:bg-zinc-700/60 active:scale-[0.98]'
                            }`}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.18, delay: i * 0.05 }}
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
                  ) : (
                    /* Color progression table */
                    <motion.div
                      key="table"
                      className="flex flex-col gap-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-500">
                        Progressão do foguinho
                      </p>
                      {FIRE_TIERS.map((tier, i) => {
                        const isAtual =
                          streak.sequenciaAtual >= tier.min &&
                          (tier.max === null || streak.sequenciaAtual <= tier.max);

                        return (
                          <motion.div
                            key={tier.min}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${isAtual ? 'ring-1' : ''}`}
                            style={
                              isAtual
                                ? {
                                    background: `rgba(${tier.theme.glowRgb},0.08)`,
                                    boxShadow: `0 0 0 1px rgba(${tier.theme.glowRgb},0.25)`,
                                  }
                                : {}
                            }
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.18, delay: i * 0.04 }}
                          >
                            <StreakFire sequencia={tier.min === 0 ? 0 : tier.min} size={28} />
                            <div className="flex-1">
                              <div className="text-xs font-medium text-white">{tier.label}</div>
                              <div className="text-[10px] text-zinc-500">
                                {tier.max === null
                                  ? `${tier.min}+ sequências`
                                  : tier.min === 0
                                  ? 'Nenhuma sequência'
                                  : `${tier.min} – ${tier.max} sequências`}
                              </div>
                            </div>
                            {isAtual && (
                              <motion.div
                                className="text-[10px] font-semibold"
                                style={{ color: tier.theme.outer }}
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                atual
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
