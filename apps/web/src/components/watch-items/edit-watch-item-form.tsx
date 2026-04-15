'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Minus, Plus, Star, Tv, X } from 'lucide-react';
import { getGeneros } from '@/lib/api/generos';
import { updateWatchItem } from '@/lib/api/watch-items';
import { useGroupTipo } from '@/lib/hooks/use-group-tipo';
import { createTemporada, updateTemporada } from '@/lib/api/temporadas';
import { WatchItem, WatchItemStatus } from '@/types/watch-item';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  item: WatchItem;
  onSuccess: () => void;
  onPendingChange?: (isPending: boolean) => void;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: {
  value: WatchItemStatus;
  label: string;
  activeColor: string;
  activeBg: string;
}[] = [
  { value: 'quero_assistir', label: 'Quero',      activeColor: '#a1a1aa', activeBg: 'rgb(39 39 42)' },
  { value: 'assistindo',     label: 'Assistindo',  activeColor: '#fbbf24', activeBg: 'rgba(251,191,36,0.12)' },
  { value: 'assistido',      label: 'Assistido',   activeColor: '#34d399', activeBg: 'rgba(52,211,153,0.12)' },
  { value: 'abandonado',     label: 'Abandonado',  activeColor: '#f87171', activeBg: 'rgba(248,113,113,0.12)' },
];

const smoothEase: [number, number, number, number] = [0.23, 1, 0.32, 1];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: smoothEase, delay: i * 0.06 },
  }),
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">
      {children}
    </p>
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
          letterSpacing: floated ? '0.1em' : '0',
        }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
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
        className={`w-full rounded-2xl bg-zinc-900 px-4 pb-3.5 pt-7 text-sm text-white outline-none transition-all duration-200 ${
          focused
            ? 'ring-2 ring-pink-500'
            : 'ring-1 ring-zinc-800 hover:ring-zinc-700'
        }`}
      />
    </div>
  );
}

function FloatTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value !== '';

  return (
    <div className="relative">
      <motion.label
        animate={{
          top: floated ? '10px' : '18px',
          fontSize: floated ? '10px' : '14px',
          color: focused ? 'rgb(236 72 153)' : floated ? 'rgb(113 113 122)' : 'rgb(82 82 91)',
          letterSpacing: floated ? '0.1em' : '0',
        }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="pointer-events-none absolute left-4 z-10 font-semibold uppercase leading-none"
      >
        {label}
      </motion.label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={3}
        className={`w-full resize-none rounded-2xl bg-zinc-900 px-4 pb-4 pt-9 text-sm text-white outline-none transition-all duration-200 ${
          focused
            ? 'ring-2 ring-pink-500'
            : 'ring-1 ring-zinc-800 hover:ring-zinc-700'
        }`}
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
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-zinc-900 px-4 py-5 ring-1 ring-zinc-800">
      <div className="flex items-center gap-1.5">
        <Star size={10} className="text-pink-400" fill="currentColor" />
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">{label}</p>
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          type="button"
          onClick={() => step(-0.5)}
          whileTap={{ scale: 0.84 }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-colors active:bg-zinc-700"
        >
          <Minus size={16} />
        </motion.button>

        <div className="relative flex h-14 w-16 items-center justify-center overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={value || 'empty'}
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.14, ease: 'easeOut' }}
              className={`absolute text-4xl font-bold tabular-nums leading-none ${
                num != null ? 'text-white' : 'text-zinc-700'
              }`}
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
          whileTap={{ scale: 0.84 }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-colors active:bg-zinc-700"
        >
          <Plus size={16} />
        </motion.button>
      </div>

      <div className="relative h-1 w-full overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full bg-pink-500"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function EditWatchItemForm({ item, onSuccess, onPendingChange }: Props) {
  const queryClient = useQueryClient();
  const groupTipo = useGroupTipo();

  const [titulo, setTitulo] = useState(item.titulo);
  const [tituloOriginal, setTituloOriginal] = useState(item.tituloOriginal ?? '');
  const [anoLancamento, setAnoLancamento] = useState(item.anoLancamento != null ? String(item.anoLancamento) : '');
  const [status, setStatus] = useState<WatchItemStatus>(item.status);
  const [notaDele, setNotaDele] = useState(String(item.notaDele ?? ''));
  const [notaDela, setNotaDela] = useState(String(item.notaDela ?? ''));
  const [dataAssistida, setDataAssistida] = useState(item.dataAssistida?.slice(0, 10) ?? '');
  const [observacoes, setObservacoes] = useState(item.observacoes ?? '');
  const [posterUrl, setPosterUrl] = useState(item.posterUrl ?? '');
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
        dataAssistida: dataAssistida || undefined,
        observacoes: observacoes || undefined,
        posterUrl: posterUrl || undefined,
        generosIds,
      });

      if (isSerie) {
        for (const t of temporadas) {
          if (!t.notaDele || !t.notaDela) continue;
          if (t.isNew) {
            await createTemporada({
              watchItemId: item.id,
              numero: Number(t.numero),
              notaDele: Number(t.notaDele),
              notaDela: Number(t.notaDela),
            });
          } else {
            await updateTemporada(t.id, {
              notaDele: Number(t.notaDele),
              notaDela: Number(t.notaDela),
            });
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watch-items'] });
      onSuccess();
    },
    onError: (error: Error) => {
      setErrorMessage(error.message);
    },
  });

  // Notify parent of pending state
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
    <form id="edit-item-form" onSubmit={handleSubmit} className="flex flex-col gap-7 pb-4">

      {/* ── Status ── */}
      <motion.section custom={0} initial="hidden" animate="visible" variants={sectionVariants}>
        <SectionLabel>Status</SectionLabel>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {STATUS_CONFIG.map(({ value, label, activeColor, activeBg }) => {
            const active = status === value;
            return (
              <motion.button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                whileTap={{ scale: 0.93 }}
                animate={{
                  backgroundColor: active ? activeBg : 'rgb(24 24 27)',
                  color: active ? activeColor : 'rgb(113 113 122)',
                  borderColor: active ? activeColor : 'rgb(63 63 70)',
                }}
                transition={{ duration: 0.18 }}
                className="flex flex-shrink-0 items-center rounded-full border px-4 py-2 text-sm font-medium"
              >
                {label}
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      {/* ── Identificação ── */}
      <motion.section custom={1} initial="hidden" animate="visible" variants={sectionVariants}>
        <SectionLabel>Identificação</SectionLabel>
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

      {/* ── Notas (filme/livro + assistido) ── */}
      <AnimatePresence>
        {shouldShowNotas && (
          <motion.section
            key="notas"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <SectionLabel>
              <Star size={10} className="mr-1 inline -mt-0.5" />
              Notas
            </SectionLabel>
            <div className={`grid gap-4 ${groupTipo === 'duo' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              <NoteCounter
                label={groupTipo === 'duo' ? 'Dele' : 'Minha nota'}
                value={notaDele}
                onChange={setNotaDele}
              />
              {groupTipo === 'duo' && (
                <NoteCounter label="Dela" value={notaDela} onChange={setNotaDela} />
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Temporadas (serie only) ── */}
      <AnimatePresence>
        {isSerie && (
          <motion.section
            key="temporadas"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <SectionLabel>
              <Tv size={10} className="mr-1 inline -mt-0.5" />
              Temporadas
            </SectionLabel>
            <div className="space-y-3">
              <AnimatePresence>
                {temporadas.map((t, index) => (
                  <motion.div
                    key={`${t.id || 'new'}-${index}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative rounded-2xl bg-zinc-950 p-4 ring-1 ring-zinc-800/60"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400">
                          {t.numero}
                        </span>
                        <span className="text-xs font-medium text-zinc-500">
                          Temporada {t.numero}
                        </span>
                      </div>
                      {t.isNew && (
                        <motion.button
                          type="button"
                          onClick={() => removeTemporada(index)}
                          whileTap={{ scale: 0.85 }}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-zinc-500 transition hover:bg-red-500/20 hover:text-red-400"
                        >
                          <X size={12} />
                        </motion.button>
                      )}
                    </div>
                    <div className={`grid gap-3 ${groupTipo === 'duo' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      <NoteCounter
                        label={groupTipo === 'duo' ? 'Dele' : 'Nota'}
                        value={t.notaDele}
                        onChange={(v) => updateTemporadaField(index, 'notaDele', v)}
                      />
                      {groupTipo === 'duo' && (
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
                className="w-full rounded-2xl border border-dashed border-zinc-800 py-3.5 text-sm font-medium text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-400"
              >
                + Adicionar temporada
              </motion.button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Detalhes ── */}
      <motion.section custom={2} initial="hidden" animate="visible" variants={sectionVariants}>
        <SectionLabel>Detalhes</SectionLabel>
        <div className="space-y-3">
          <FloatInput label="Data assistida" value={dataAssistida} onChange={setDataAssistida} type="date" />
          <FloatInput label="Poster URL" value={posterUrl} onChange={setPosterUrl} type="url" />
          <FloatTextarea label="Observações" value={observacoes} onChange={setObservacoes} />
        </div>
      </motion.section>

      {/* ── Gêneros ── */}
      {generos.length > 0 && (
        <motion.section
          id="edit-generos-section"
          custom={3}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <SectionLabel>Gêneros</SectionLabel>

          {/* Alert banner */}
          <AnimatePresence>
            {genreAlert && (
              <motion.div
                key="genre-alert"
                initial={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 10, marginBottom: 14 }}
                exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <motion.div
                  animate={{ opacity: [0.75, 1, 0.75] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex items-center gap-3 rounded-2xl bg-amber-500/10 px-4 py-3 ring-1 ring-amber-500/25"
                >
                  <motion.span
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.65, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.4 }}
                    className="text-xl leading-none select-none"
                  >
                    👇
                  </motion.span>
                  <div>
                    <p className="text-sm font-semibold text-amber-400 leading-snug">
                      Escolha ao menos um gênero
                    </p>
                    <p className="mt-0.5 text-xs text-amber-400/60">
                      Toque em um dos itens abaixo para continuar
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pills with pulsing ring on alert */}
          <motion.div
            className="flex flex-wrap gap-2 rounded-2xl p-0.5"
            animate={genreAlert
              ? { boxShadow: ['0 0 0 0px rgba(251,191,36,0)', '0 0 0 2px rgba(251,191,36,0.35)', '0 0 0 0px rgba(251,191,36,0)'] }
              : { boxShadow: '0 0 0 0px rgba(251,191,36,0)' }
            }
            transition={genreAlert
              ? { duration: 1.4, repeat: 1, ease: 'easeInOut' }
              : { duration: 0.4 }
            }
          >
            {generos.map((genero, i) => {
              const active = generosIds.includes(genero.id);
              return (
                <motion.button
                  key={genero.id}
                  type="button"
                  onClick={() => toggleGenero(genero.id)}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.025, duration: 0.2 } }}
                  style={{
                    backgroundColor: active ? 'rgb(236 72 153)' : 'rgb(24 24 27)',
                    color: active ? 'white' : 'rgb(113 113 122)',
                    borderColor: active ? 'rgb(236 72 153)' : 'rgb(63 63 70)',
                  }}
                  className="rounded-full border px-3.5 py-1.5 text-sm font-medium transition-shadow"
                >
                  {active && (
                    <motion.span
                      initial={{ opacity: 0, width: 0, marginRight: 0 }}
                      animate={{ opacity: 1, width: 'auto', marginRight: 4 }}
                      exit={{ opacity: 0, width: 0, marginRight: 0 }}
                      className="inline-block"
                    >
                      ✓
                    </motion.span>
                  )}
                  {genero.nome}
                </motion.button>
              );
            })}
          </motion.div>
        </motion.section>
      )}

      {/* ── Error ── */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-xl bg-red-950/40 px-3.5 py-3 ring-1 ring-red-500/20"
          >
            <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
            <p className="text-xs text-red-400">{errorMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
