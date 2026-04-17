'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft } from 'lucide-react';
import type { StreakTipo } from '@/types/streak';

// ─── Tipos tabs ───────────────────────────────────────────────────────────────

const TABS: { value: StreakTipo; label: string }[] = [
  { value: 'daily',   label: 'Diário'        },
  { value: 'weekend', label: 'Fim de semana' },
  { value: 'monthly', label: 'Mensal'        },
];

// ─── Step item ────────────────────────────────────────────────────────────────

type StepStatus = 'on' | 'off' | 'wait' | 'reset';

const STEP_COLORS: Record<StepStatus, { dot: string; bg: string; text: string }> = {
  on:    { dot: '#f97316', bg: 'rgba(249,115,22,0.10)', text: '#f97316' },
  off:   { dot: '#52525b', bg: 'rgba(82,82,91,0.10)',   text: '#71717a' },
  wait:  { dot: '#3b82f6', bg: 'rgba(59,130,246,0.10)', text: '#60a5fa' },
  reset: { dot: '#ef4444', bg: 'rgba(239,68,68,0.10)',  text: '#f87171' },
};

const STATUS_ICONS: Record<StepStatus, string> = {
  on:    '🔥',
  off:   '⬜',
  wait:  '⏳',
  reset: '↩️',
};

interface StepProps {
  index: number;
  status: StepStatus;
  title: string;
  desc: string;
}

function Step({ index, status, title, desc }: StepProps) {
  const c = STEP_COLORS[status];
  return (
    <motion.div
      className="flex gap-3"
      variants={{
        hidden: { opacity: 0, y: 14, scale: 0.96 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
        exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
      }}
    >
      {/* Left column: dot + line */}
      <div className="flex flex-col items-center pt-0.5">
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
          style={{ background: c.bg, color: c.text, boxShadow: `0 0 0 1px ${c.dot}33` }}
        >
          {index + 1}
        </div>
        {index < 3 && <div className="mt-1 w-px flex-1 bg-zinc-800" style={{ minHeight: 16 }} />}
      </div>

      {/* Right column: content */}
      <div className="pb-4 pt-0.5">
        <div className="flex items-center gap-1.5">
          <span>{STATUS_ICONS[status]}</span>
          <span className="text-xs font-semibold text-white">{title}</span>
        </div>
        <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">{desc}</p>
      </div>
    </motion.div>
  );
}

// ─── Conteúdo por tipo ────────────────────────────────────────────────────────

const CONTENT: Record<StreakTipo, { meta: string; passos: StepProps[] }> = {
  daily: {
    meta: 'Pelo menos 1 atividade registrada por dia.',
    passos: [
      { index: 0, status: 'on',    title: 'Registra hoje',           desc: 'Fogo acende. A sequência sobe em +1.' },
      { index: 1, status: 'off',   title: 'Amanhã sem atividade',    desc: 'Novo dia começa. O fogo apaga enquanto você não registrar.' },
      { index: 2, status: 'on',    title: 'Registra no dia seguinte', desc: 'Fogo acende de novo. Se for o dia consecutivo, sequência +1.' },
      { index: 3, status: 'reset', title: 'Pulou um dia',            desc: 'Sequência reseta para 1. O fogo acende, mas do zero.' },
    ],
  },
  weekend: {
    meta: 'Pelo menos 1 atividade entre Sexta, Sábado ou Domingo.',
    passos: [
      { index: 0, status: 'on',   title: 'Registra Sex / Sáb / Dom', desc: 'Fogo acende. A sequência sobe.' },
      { index: 1, status: 'wait', title: 'Seg – Qui sem atividade',   desc: 'O fogo permanece aceso. A semana não conta contra você.' },
      { index: 2, status: 'off',  title: 'Próxima Sexta chega',       desc: 'Novo fim de semana começa. O fogo apaga até você registrar.' },
      { index: 3, status: 'on',   title: 'Registra no novo fim de semana', desc: 'Fogo acende. Sequência consecutiva mantida.' },
    ],
  },
  monthly: {
    meta: 'Pelo menos 1 atividade registrada por mês.',
    passos: [
      { index: 0, status: 'on',   title: 'Registra qualquer dia do mês', desc: 'Fogo acende. Sequência sobe.' },
      { index: 1, status: 'wait', title: 'Restante do mês',              desc: 'O fogo permanece aceso. Você já cumpriu o mês.' },
      { index: 2, status: 'off',  title: 'Virada do mês sem atividade',  desc: 'Novo mês começa. O fogo apaga até você registrar.' },
      { index: 3, status: 'on',   title: 'Registra no novo mês',         desc: 'Fogo acende. Sequência consecutiva mantida.' },
    ],
  },
};

// ─── Conteúdo do tab ativo ────────────────────────────────────────────────────

function TabContent({ tipo }: { tipo: StreakTipo }) {
  const { meta, passos } = CONTENT[tipo];
  return (
    <motion.div
      key={tipo}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } }, exit: {} }}
    >
      {/* Meta badge */}
      <motion.div
        className="mb-4 rounded-2xl bg-zinc-800/50 px-4 py-3"
        variants={{
          hidden: { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
          exit:    { opacity: 0 },
        }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Meta</p>
        <p className="mt-0.5 text-sm font-medium text-white">{meta}</p>
      </motion.div>

      {/* Steps */}
      {passos.map((s) => (
        <Step key={s.index} {...s} />
      ))}
    </motion.div>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function TabBtn({ label, ativo, onClick }: { label: string; ativo: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative flex-1 rounded-xl py-2 text-[11px] font-semibold transition-colors"
      style={
        ativo
          ? { color: '#fff', background: 'rgba(255,255,255,0.09)', boxShadow: '0 0 0 1px rgba(255,255,255,0.12)' }
          : { color: '#52525b', background: 'rgba(255,255,255,0.03)' }
      }
      whileTap={{ scale: 0.95 }}
    >
      {label}
    </motion.button>
  );
}

// ─── O que conta ─────────────────────────────────────────────────────────────

const EVENTOS = ['Novo item', 'Nova temporada', 'Avaliação (duo)'];

// ─── Transições da sheet ──────────────────────────────────────────────────────

const sheetVariants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: { type: 'spring' as const, damping: 30, stiffness: 300, mass: 0.85 },
  },
  exit: {
    y: '100%',
    transition: { duration: 0.26, ease: [0.4, 0, 1, 1] as const },
  },
};

// ─── Modal principal ──────────────────────────────────────────────────────────

interface StreakHelpModalProps {
  open: boolean;
  onBack: () => void;   // ← volta ao modal do foguinho
  onClose: () => void;  // X fecha tudo
}

export function StreakHelpModal({ open, onBack, onClose }: StreakHelpModalProps) {
  const [tab, setTab] = useState<StreakTipo | null>(null);

  function handleBack() {
    setTab(null);
    onBack();
  }

  function handleClose() {
    setTab(null);
    onClose();
  }

  function handleTab(t: StreakTipo) {
    setTab((prev) => (prev === t ? null : t));
  }

  return (
    <>
      {/* ── Backdrop — AnimatePresence próprio ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      {/* ── Sheet — AnimatePresence próprio ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center sm:inset-0 sm:items-center sm:px-4"
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              className="pointer-events-auto w-full max-w-md overflow-hidden rounded-t-3xl bg-[#0d0d0f] pb-safe sm:rounded-3xl"
              style={{ boxShadow: '0 -24px 80px -8px rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.06)' }}
            >
              {/* Handle */}
              <div className="flex justify-center pb-1 pt-3 sm:hidden">
                <div className="h-1 w-10 rounded-full bg-zinc-700/80" />
              </div>

              <div className="px-5 pb-8 pt-4">
                {/* Nav bar */}
                <div className="mb-5 flex items-center justify-between">
                  <motion.button
                    onClick={handleBack}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-400 transition-colors hover:text-white"
                    whileTap={{ scale: 0.92 }}
                  >
                    <ArrowLeft size={14} />
                  </motion.button>

                  <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    Como funciona
                  </span>

                  <motion.button
                    onClick={handleClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-400 transition-colors hover:text-white"
                    whileTap={{ scale: 0.92 }}
                  >
                    <X size={14} />
                  </motion.button>
                </div>

                {/* Intro */}
                <motion.div
                  className="mb-5"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h2 className="text-base font-bold text-white">O foguinho</h2>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                    Mantenha sua sequência registrando atividades dentro do período do seu tipo de foguinho.
                    Quanto mais consistente, maior a sequência — e mais vivo o fogo.
                  </p>

                  {/* O que conta */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {EVENTOS.map((e) => (
                      <span
                        key={e}
                        className="rounded-full bg-zinc-800/80 px-2.5 py-1 text-[10px] font-medium text-zinc-400 ring-1 ring-white/8"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                </motion.div>

                {/* Separador */}
                <div className="mb-4 h-px bg-zinc-800/80" />

                {/* Tabs */}
                <motion.div
                  className="mb-4 flex gap-1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, delay: 0.1 }}
                >
                  {TABS.map((t) => (
                    <TabBtn
                      key={t.value}
                      label={t.label}
                      ativo={tab === t.value}
                      onClick={() => handleTab(t.value)}
                    />
                  ))}
                </motion.div>

                {/* Tab content */}
                <div className="overflow-hidden">
                  <AnimatePresence mode="wait">
                    {tab ? (
                      <motion.div
                        key={tab}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <TabContent tipo={tab} />
                      </motion.div>
                    ) : (
                      <motion.p
                        key="hint"
                        className="text-center text-[11px] text-zinc-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        Selecione um tipo acima para ver como funciona.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
