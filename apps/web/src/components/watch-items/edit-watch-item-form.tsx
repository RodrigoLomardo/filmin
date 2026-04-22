'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAchievementCheck } from '@/lib/achievement-context';
import { Ban, CheckCircle2, Clock, Minus, Play, Plus, Star, X } from 'lucide-react';
import { getGeneros } from '@/lib/api/generos';
import { updateWatchItem } from '@/lib/api/watch-items';
import { useGroupTipo } from '@/lib/hooks/use-group-tipo';
import { createTemporada, updateTemporada } from '@/lib/api/temporadas';
import { GalleryType, WatchItem, WatchItemStatus } from '@/types/watch-item';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  item: WatchItem;
  gallery?: GalleryType;
  onSuccess: () => void;
  onPendingChange?: (isPending: boolean) => void;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: {
  value: WatchItemStatus;
  label: string;
  icon: React.ElementType;
  activeColor: string;
  activeBg: string;
  activeBorder: string;
}[] = [
  { value: 'quero_assistir', label: 'Quero ver',  icon: Clock,        activeColor: '#a1a1aa', activeBg: 'rgba(161,161,170,0.1)', activeBorder: 'rgba(161,161,170,0.35)' },
  { value: 'assistindo',     label: 'Assistindo', icon: Play,         activeColor: '#fbbf24', activeBg: 'rgba(251,191,36,0.1)',  activeBorder: 'rgba(251,191,36,0.35)' },
  { value: 'assistido',      label: 'Assistido',  icon: CheckCircle2, activeColor: '#34d399', activeBg: 'rgba(52,211,153,0.1)',  activeBorder: 'rgba(52,211,153,0.35)' },
  { value: 'abandonado',     label: 'Abandonado', icon: Ban,          activeColor: '#f87171', activeBg: 'rgba(248,113,113,0.1)', activeBorder: 'rgba(248,113,113,0.35)' },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.36,
      ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
      delay: i * 0.055,
    },
  }),
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Divider({ label }: { label: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-[0.24em] text-zinc-600">
        {label}
      </span>
      <div className="h-px flex-1" style={{ background: 'rgba(63,63,70,0.5)' }} />
    </div>
  );
}

function FloatInput({
  label,
  value,
  onChange,
  type = 'text',
  required,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  const [focused, setFocused] = useState(false);
  const floated = type === 'date' || focused || value !== '';

  return (
    <div className="relative">
      <motion.label
        animate={{
          top: floated ? '8px' : '50%',
          y: floated ? '0%' : '-50%',
          fontSize: floated ? '10px' : '14px',
          color: focused ? 'rgb(236 72 153)' : floated ? 'rgb(113 113 122)' : 'rgb(82 82 91)',
          letterSpacing: floated ? '0.08em' : '0',
        }}
        transition={{ duration: 0.18, ease: 'easeOut' as const }}
        className="pointer-events-none absolute left-4 z-10 font-semibold uppercase leading-none"
      >
        {label}
        {required && <span className="ml-0.5 text-pink-500">*</span>}
      </motion.label>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        className="w-full rounded-2xl bg-zinc-900 px-4 pb-3.5 pt-7 text-sm text-white outline-none"
        style={{
          boxShadow: focused
            ? '0 0 0 1.5px rgb(236,72,153)'
            : '0 0 0 1px rgb(39,39,42)',
          transition: 'box-shadow 0.18s ease',
        }}
      />
    </div>
  );
}


function NoteCounter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const num = value === '' ? null : Number(value);

  function step(delta: number) {
    const current = num ?? 5;
    const next = Math.min(10, Math.max(0, parseFloat((current + delta).toFixed(1))));
    onChange(String(next));
  }

  const pct = num != null ? (num / 10) * 100 : 0;

  return (
    <div
      className="flex flex-col gap-3.5 rounded-2xl px-4 py-4"
      style={{ background: 'rgb(24,24,27)', boxShadow: '0 0 0 1px rgb(39,39,42)' }}
    >
      <div className="flex items-center gap-2">
        <Star size={10} fill="#ec4899" style={{ color: '#ec4899', flexShrink: 0 }} />
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">{label}</span>
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          onClick={() => step(-0.5)}
          whileTap={{ scale: 0.78 }}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-400"
        >
          <Minus size={14} />
        </motion.button>

        <div
          className="relative flex flex-1 items-center justify-center overflow-hidden"
          style={{ height: 50 }}
        >
          <AnimatePresence mode="popLayout">
            <motion.span
              key={value || 'empty'}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.13, ease: 'easeOut' as const }}
              className="absolute text-[40px] font-bold tabular-nums leading-none"
              style={{ color: num != null ? '#ec4899' : '#52525b' }}
            >
              {num != null
                ? Number.isInteger(num) ? num : num.toFixed(1)
                : '—'}
            </motion.span>
          </AnimatePresence>
        </div>

        <motion.button
          type="button"
          onClick={() => step(0.5)}
          whileTap={{ scale: 0.78 }}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-400"
        >
          <Plus size={14} />
        </motion.button>
      </div>

      <div className="relative h-[3px] overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.25, ease: 'easeOut' as const }}
          style={{ backgroundColor: '#ec4899' }}
        />
      </div>
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function EditWatchItemForm({ item, gallery, onSuccess, onPendingChange }: Props) {
  const queryClient = useQueryClient();
  const groupTipo = useGroupTipo();
  const triggerAchievementCheck = useAchievementCheck();
  // Solo quando gallery é 'solo' OU usuário não é duo
  const isSolo = gallery === 'solo' || groupTipo !== 'duo';

  const [titulo, setTitulo] = useState(item.titulo);
  const [tituloOriginal, setTituloOriginal] = useState(item.tituloOriginal ?? '');
  const [anoLancamento, setAnoLancamento] = useState(
    item.anoLancamento != null ? String(item.anoLancamento) : '',
  );
  const [status, setStatus] = useState<WatchItemStatus>(item.status);
  const [notaDele, setNotaDele] = useState(String(item.notaDele ?? ''));
  const [notaDela, setNotaDela] = useState(String(item.notaDela ?? ''));
  const [generosIds, setGenerosIds] = useState<string[]>(item.generos.map((g) => g.id));
  const [errorMessage, setErrorMessage] = useState('');
  const [genreAlert, setGenreAlert] = useState(false);

  const [temporadas, setTemporadas] = useState(
    item.temporadas
      .sort((a, b) => a.numero - b.numero)
      .map((t) => ({
        id: t.id,
        numero: String(t.numero),
        notaDele: String(t.notaDele ?? ''),
        notaDela: String(t.notaDela ?? ''),
        isNew: false,
      })),
  );

  const { data: generos = [] } = useQuery({
    queryKey: ['generos'],
    queryFn: getGeneros,
  });

  const isSerie = item.tipo === 'serie';
  const shouldShowNotas = useMemo(
    () => !isSerie && status === 'assistido',
    [isSerie, status],
  );

  const mutation = useMutation({
    mutationFn: async () => {
      await updateWatchItem(item.id, {
        titulo,
        tituloOriginal: tituloOriginal || undefined,
        anoLancamento: anoLancamento ? Number(anoLancamento) : undefined,
        status,
        notaDele: shouldShowNotas && notaDele ? Number(notaDele) : undefined,
        notaDela: shouldShowNotas && notaDela ? Number(notaDela) : undefined,
        dataAssistida: item.dataAssistida || undefined,
        observacoes: item.observacoes || undefined,
        posterUrl: item.posterUrl || undefined,
        generosIds,
      });

      if (isSerie) {
        for (const t of temporadas) {
          if (!t.notaDele) continue;
          if (!isSolo && !t.notaDela) continue;
          if (t.isNew) {
            await createTemporada({
              watchItemId: item.id,
              numero: Number(t.numero),
              notaDele: Number(t.notaDele),
              notaDela: !isSolo ? Number(t.notaDela) : undefined,
            });
          } else {
            await updateTemporada(t.id, {
              notaDele: Number(t.notaDele),
              notaDela: !isSolo ? Number(t.notaDela) : undefined,
            });
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watch-items'] });
      void triggerAchievementCheck();
      onSuccess();
    },
    onError: (error: Error) => {
      setErrorMessage(error.message);
    },
  });

  useEffect(() => {
    onPendingChange?.(mutation.isPending);
  }, [mutation.isPending, onPendingChange]);

  function toggleGenero(id: string) {
    setGenerosIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  }

  function removeTemporada(index: number) {
    setTemporadas((prev) => prev.filter((_, i) => i !== index));
  }

  function addTemporada() {
    setTemporadas((prev) => [
      ...prev,
      { id: '', numero: String(prev.length + 1), notaDele: '', notaDela: '', isNew: true },
    ]);
  }

  function updateTemporadaField(index: number, field: string, value: string) {
    setTemporadas((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)),
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage('');

    if (generosIds.length === 0) {
      setGenreAlert(true);
      setTimeout(() => setGenreAlert(false), 2800);
      document.getElementById('edit-generos-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    mutation.mutate();
  }

  return (
    <form id="edit-item-form" onSubmit={handleSubmit} className="flex flex-col gap-6 pb-4">

      {/* ── Status ── */}
      <motion.section custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <Divider label="Status" />
        <div className="grid grid-cols-2 gap-2">
          {STATUS_CONFIG.map(({ value, label, icon: StatusIcon, activeColor, activeBg, activeBorder }) => {
            const active = status === value;
            return (
              <motion.button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                whileTap={{ scale: 0.94 }}
                animate={{
                  backgroundColor: active ? activeBg : 'rgba(24,24,27,0.7)',
                  borderColor: active ? activeBorder : 'rgba(63,63,70,0.5)',
                }}
                transition={{ duration: 0.18 }}
                className="relative flex items-center gap-2.5 rounded-2xl border py-3 pl-3.5 pr-3 text-left"
              >
                <StatusIcon
                  size={14}
                  style={{ color: active ? activeColor : '#52525b', flexShrink: 0 }}
                />
                <span
                  className="flex-1 text-[13px] font-medium leading-none"
                  style={{ color: active ? activeColor : '#71717a' }}
                >
                  {label}
                </span>
                <motion.span
                  animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.4 }}
                  transition={{ duration: 0.18 }}
                  className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: activeColor }}
                />
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      {/* ── Identificação ── */}
      <motion.section custom={1} initial="hidden" animate="visible" variants={fadeUp}>
        <Divider label="Identificação" />
        <div className="space-y-3">
          <FloatInput label="Título" value={titulo} onChange={setTitulo} required />
          <FloatInput label="Título original" value={tituloOriginal} onChange={setTituloOriginal} />
          <FloatInput
            label="Ano"
            value={anoLancamento}
            onChange={setAnoLancamento}
            type="number"
            inputMode="numeric"
          />
        </div>
      </motion.section>

      {/* ── Notas ── */}
      <AnimatePresence>
        {shouldShowNotas && (
          <motion.section
            key="notas"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' as const }}
            className="overflow-hidden"
          >
            <Divider label="Notas" />
            <div className={`grid gap-3 ${!isSolo ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <NoteCounter
                label={!isSolo ? 'Dele' : 'Minha nota'}
                value={notaDele}
                onChange={setNotaDele}
              />
              {!isSolo && (
                <NoteCounter label="Dela" value={notaDela} onChange={setNotaDela} />
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Temporadas ── */}
      <AnimatePresence>
        {isSerie && (
          <motion.section
            key="temporadas"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' as const }}
            className="overflow-hidden"
          >
            <Divider label="Temporadas" />
            <div className="space-y-2.5">
              <AnimatePresence>
                {temporadas.map((t, index) => (
                  <motion.div
                    key={`${t.id || 'new'}-${index}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative rounded-2xl p-4"
                    style={{ background: 'rgba(24,24,27,0.8)', boxShadow: '0 0 0 1px rgba(63,63,70,0.45)' }}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[9px] font-bold text-zinc-400">
                          {t.numero}
                        </span>
                        <span className="text-[11px] font-medium text-zinc-500">
                          Temporada {t.numero}
                        </span>
                      </div>
                      {t.isNew && (
                        <motion.button
                          type="button"
                          onClick={() => removeTemporada(index)}
                          whileTap={{ scale: 0.85 }}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-zinc-500 transition hover:bg-red-500/20 hover:text-red-400"
                        >
                          <X size={11} />
                        </motion.button>
                      )}
                    </div>
                    <div className={`grid gap-2.5 ${!isSolo ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      <NoteCounter
                        label={!isSolo ? 'Dele' : 'Nota'}
                        value={t.notaDele}
                        onChange={(v) => updateTemporadaField(index, 'notaDele', v)}
                      />
                      {!isSolo && (
                        <NoteCounter
                          label="Dela"
                          value={t.notaDela}
                          onChange={(v) => updateTemporadaField(index, 'notaDela', v)}
                        />
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <motion.button
                type="button"
                onClick={addTemporada}
                whileTap={{ scale: 0.97 }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[13px] font-medium text-zinc-500 transition hover:text-zinc-400"
                style={{ border: '1px dashed rgba(63,63,70,0.6)' }}
              >
                <Plus size={12} />
                Adicionar temporada
              </motion.button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Gêneros ── */}
      {generos.length > 0 && (
        <motion.section
          id="edit-generos-section"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <Divider label="Gêneros" />

          <AnimatePresence>
            {genreAlert && (
              <motion.div
                key="genre-alert"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                style={{ overflow: 'hidden' }}
              >
                <div
                  className="flex items-center gap-3 rounded-2xl px-4 py-3"
                  style={{ background: 'rgba(251,191,36,0.07)', boxShadow: '0 0 0 1px rgba(251,191,36,0.18)' }}
                >
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.5 }}
                    className="select-none text-lg leading-none"
                  >
                    👇
                  </motion.span>
                  <div>
                    <p className="text-sm font-semibold leading-snug text-amber-400">
                      Escolha ao menos um gênero
                    </p>
                    <p className="mt-0.5 text-xs text-amber-400/50">
                      Toque em um dos itens abaixo
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap gap-2">
            {generos.map((genero, i) => {
              const active = generosIds.includes(genero.id);
              return (
                <motion.button
                  key={genero.id}
                  type="button"
                  onClick={() => toggleGenero(genero.id)}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    backgroundColor: active ? 'rgb(236,72,153)' : 'rgba(24,24,27,0.9)',
                    borderColor: active ? 'rgb(236,72,153)' : 'rgba(63,63,70,0.6)',
                    color: active ? '#fff' : 'rgb(113,113,122)',
                  }}
                  transition={{
                    opacity: { delay: i * 0.018, duration: 0.2 },
                    scale: { delay: i * 0.018, duration: 0.2 },
                    backgroundColor: { duration: 0.16 },
                    borderColor: { duration: 0.16 },
                    color: { duration: 0.16 },
                  }}
                  className="rounded-full border px-3.5 py-1.5 text-[13px] font-medium"
                >
                  {active && (
                    <motion.span
                      initial={{ opacity: 0, width: 0, marginRight: 0 }}
                      animate={{ opacity: 1, width: 'auto', marginRight: 4 }}
                      className="inline-block text-[10px]"
                    >
                      ✓
                    </motion.span>
                  )}
                  {genero.nome}
                </motion.button>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* ── Error ── */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2.5 rounded-2xl px-4 py-3"
            style={{ background: 'rgba(248,113,113,0.07)', boxShadow: '0 0 0 1px rgba(248,113,113,0.18)' }}
          >
            <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
            <p className="text-xs text-red-400">{errorMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
