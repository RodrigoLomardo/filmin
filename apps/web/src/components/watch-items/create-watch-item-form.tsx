'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Film,
  Tv,
  BookOpen,
  ArrowLeft,
  Check,
  Loader2,
  Minus,
  Plus,
  Star,
  ImageIcon,
  X,
} from 'lucide-react';
import { getGeneros } from '@/lib/api/generos';
import { createWatchItem } from '@/lib/api/watch-items';
import { createTemporada } from '@/lib/api/temporadas';
import { WatchItemStatus, WatchItemTipo } from '@/types/watch-item';
import { useGroupTipo } from '@/lib/hooks/use-group-tipo';

// ─── Constants ────────────────────────────────────────────────────────────────

const TIPO_CONFIG: {
  value: WatchItemTipo;
  label: string;
  Icon: React.ElementType;
  activeClass: string;
  ringClass: string;
}[] = [
    {
      value: 'filme',
      label: 'Filme',
      Icon: Film,
      activeClass: 'bg-gradient-to-br from-pink-500/25 to-rose-700/15 text-pink-400',
      ringClass: 'ring-pink-500/60',
    },
    {
      value: 'serie',
      label: 'Série',
      Icon: Tv,
      activeClass: 'bg-gradient-to-br from-violet-500/25 to-indigo-700/15 text-violet-400',
      ringClass: 'ring-violet-500/60',
    },
    {
      value: 'livro',
      label: 'Livro',
      Icon: BookOpen,
      activeClass: 'bg-gradient-to-br from-amber-500/25 to-orange-700/15 text-amber-400',
      ringClass: 'ring-amber-500/60',
    },
  ];

const STATUS_CONFIG: { value: WatchItemStatus; label: string; emoji: string }[] = [
  { value: 'quero_assistir', label: 'Quero', emoji: '🎯' },
  { value: 'assistindo', label: 'Assistindo', emoji: '▶️' },
  { value: 'assistido', label: 'Assistido', emoji: '✅' },
  { value: 'abandonado', label: 'Abandonado', emoji: '🚫' },
];

// ─── Section animation variants ───────────────────────────────────────────────

import type { Variants } from 'framer-motion';

const smoothEase: [number, number, number, number] = [0.23, 1, 0.32, 1];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: smoothEase,
      delay: i * 0.07,
    },
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
        className={`w-full rounded-2xl bg-zinc-900 px-4 pb-3.5 pt-7 text-sm text-white outline-none transition-all duration-200 ${focused ? 'ring-2 ring-pink-500' : 'ring-1 ring-zinc-800 hover:ring-zinc-700'
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
        className={`w-full resize-none rounded-2xl bg-zinc-900 px-4 pb-4 pt-9 text-sm text-white outline-none transition-all duration-200 ${focused ? 'ring-2 ring-pink-500' : 'ring-1 ring-zinc-800 hover:ring-zinc-700'
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
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">{label}</p>

      <div className="flex items-center gap-4">
        <motion.button
          type="button"
          onClick={() => step(-0.5)}
          whileTap={{ scale: 0.84 }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-colors active:bg-zinc-700"
        >
          <Minus size={18} />
        </motion.button>

        <div className="relative flex h-16 w-20 items-center justify-center overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={value || 'empty'}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.14, ease: 'easeOut' }}
              className={`absolute text-5xl font-bold tabular-nums leading-none ${num != null ? 'text-white' : 'text-zinc-700'
                }`}
            >
              {num != null
                ? Number.isInteger(num)
                  ? num
                  : num.toFixed(1)
                : '—'}
            </motion.span>
          </AnimatePresence>
        </div>

        <motion.button
          type="button"
          onClick={() => step(0.5)}
          whileTap={{ scale: 0.84 }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-colors active:bg-zinc-700"
        >
          <Plus size={18} />
        </motion.button>
      </div>

      {/* Progress bar */}
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

function PosterInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [imgError, setImgError] = useState(false);

  const floated = focused || value !== '';
  const hasPreview = value !== '' && !imgError;

  useEffect(() => {
    setImgError(false);
  }, [value]);

  return (
    <div className="flex gap-3 items-start">
      <AnimatePresence>
        {hasPreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.75, width: 0 }}
            animate={{ opacity: 1, scale: 1, width: 52 }}
            exit={{ opacity: 0, scale: 0.75, width: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="flex-shrink-0 overflow-hidden"
          >
            <div className="aspect-[2/3] w-[52px] overflow-hidden rounded-xl ring-1 ring-pink-500/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Poster preview"
                className="h-full w-full object-cover"
                onError={() => setImgError(true)}
              />
            </div>
          </motion.div>
        )}

        {!hasPreview && value === '' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-shrink-0"
          >
            <div className="flex aspect-[2/3] w-[52px] items-center justify-center rounded-xl bg-zinc-900 ring-1 ring-zinc-800">
              <ImageIcon size={18} className="text-zinc-700" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex-1">
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
          Poster URL
        </motion.label>
        <input
          type="url"
          inputMode="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full rounded-2xl bg-zinc-900 px-4 pb-3.5 pt-7 text-sm text-white outline-none transition-all duration-200 ${focused ? 'ring-2 ring-pink-500' : 'ring-1 ring-zinc-800 hover:ring-zinc-700'
            }`}
        />
      </div>
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function CreateWatchItemForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const groupTipo = useGroupTipo();

  const [titulo, setTitulo] = useState('');
  const [tituloOriginal, setTituloOriginal] = useState('');
  const [anoLancamento, setAnoLancamento] = useState('');
  const [tipo, setTipo] = useState<WatchItemTipo>('filme');
  const [status, setStatus] = useState<WatchItemStatus>('quero_assistir');
  const [notaDele, setNotaDele] = useState('');
  const [notaDela, setNotaDela] = useState('');
  const [dataAssistida, setDataAssistida] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [generosIds, setGenerosIds] = useState<string[]>([]);
  const [temporadas, setTemporadas] = useState<
    { numero: string; notaDele: string; notaDela: string }[]
  >([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { data: generos = [] } = useQuery({
    queryKey: ['generos'],
    queryFn: getGeneros,
  });

  const mutation = useMutation({
    mutationFn: async (payload: Parameters<typeof createWatchItem>[0]) => {
      const createdItem = await createWatchItem(payload);

      if (createdItem.tipo === 'serie') {
        const isDuo = groupTipo === 'duo';
        for (const t of temporadas) {
          if (!t.notaDele) continue;
          if (isDuo && !t.notaDela) continue;
          await createTemporada({
            watchItemId: createdItem.id,
            numero: Number(t.numero),
            notaDele: Number(t.notaDele),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            notaDela: isDuo ? Number(t.notaDela) : (undefined as any),
          });
        }
      }

      return createdItem;
    },
    onSuccess: (createdItem) => {
      queryClient.invalidateQueries({ queryKey: ['watch-items'] });
      setErrorMessage('');

      if (createdItem.tipo === 'serie') {
        router.push(`/series/${createdItem.id}/temporadas`);
        return;
      }

      setSuccessMessage('Item adicionado ao acervo!');
      setTitulo('');
      setTituloOriginal('');
      setAnoLancamento('');
      setTipo('filme');
      setStatus('quero_assistir');
      setNotaDele('');
      setNotaDela('');
      setDataAssistida('');
      setObservacoes('');
      setPosterUrl('');
      setGenerosIds([]);
      setTemporadas([]);
    },
    onError: (error: Error) => {
      setSuccessMessage('');
      setErrorMessage(error.message);
    },
  });

  function addTemporada() {
    setTemporadas((prev) => [
      ...prev,
      { numero: String(prev.length + 1), notaDele: '', notaDela: '' },
    ]);
  }

  function removeTemporada(index: number) {
    setTemporadas((prev) => prev.filter((_, i) => i !== index));
  }

  function updateTemporadaField(index: number, field: string, value: string) {
    setTemporadas((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)),
    );
  }

  const shouldShowNotas = useMemo(
    () => (tipo === 'filme' || tipo === 'livro') && status === 'assistido',
    [tipo, status],
  );

  function toggleGenero(id: string) {
    setGenerosIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    mutation.mutate({
      titulo,
      tituloOriginal: tituloOriginal || undefined,
      anoLancamento: Number(anoLancamento),
      tipo,
      status,
      notaDele: shouldShowNotas && notaDele ? Number(notaDele) : undefined,
      notaDela: shouldShowNotas && notaDela ? Number(notaDela) : undefined,
      dataAssistida: dataAssistida || undefined,
      observacoes: observacoes || undefined,
      posterUrl: posterUrl || undefined,
      generosIds,
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-zinc-900/60 bg-black/90 px-5 py-4 backdrop-blur-md">
        <motion.button
          type="button"
          onClick={() => window.history.back()}
          whileTap={{ scale: 0.88 }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft size={18} />
        </motion.button>
        <div>
          <h1 className="text-base font-bold leading-none text-white">Novo título</h1>
          <p className="mt-0.5 text-[11px] text-zinc-600">Adicione ao seu acervo</p>
        </div>
      </div>

      {/* ── Form ── */}
      <form id="watch-item-form" onSubmit={handleSubmit} className="flex flex-col gap-8 px-5 pb-36 pt-7">

        {/* Section 1 — Tipo */}
        <motion.section
          custom={0}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <SectionLabel>Tipo de mídia</SectionLabel>
          <div className="grid grid-cols-3 gap-3">
            {TIPO_CONFIG.map(({ value, label, Icon, activeClass, ringClass }) => {
              const active = tipo === value;
              return (
                <motion.button
                  key={value}
                  type="button"
                  onClick={() => setTipo(value)}
                  whileTap={{ scale: 0.93 }}
                  animate={{
                    opacity: active ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.15 }}
                  className={`flex flex-col items-center gap-2.5 rounded-2xl py-5 ring-1 transition-all duration-200 ${active
                    ? `${activeClass} ${ringClass} opacity-100`
                    : 'bg-zinc-950 ring-zinc-800/60 text-zinc-600'
                    }`}
                >
                  <Icon size={22} />
                  <span className="text-xs font-semibold">{label}</span>
                  {active && (
                    <motion.div
                      layoutId="tipo-indicator"
                      className="h-1 w-4 rounded-full bg-current opacity-60"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.section>

        {/* Section 2 — Status */}
        <motion.section custom={1} initial="hidden" animate="visible" variants={sectionVariants}>
          <SectionLabel>Status</SectionLabel>
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {STATUS_CONFIG.map(({ value, label, emoji }) => {
              const active = status === value;
              return (
                <motion.button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  whileTap={{ scale: 0.93 }}
                  animate={{
                    backgroundColor: active ? 'rgb(236 72 153)' : 'rgb(24 24 27)',
                    color: active ? 'white' : 'rgb(113 113 122)',
                    borderColor: active ? 'rgb(236 72 153)' : 'rgb(63 63 70)',
                  }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-shrink-0 items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-medium"
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.section>

        {/* Section 3 — Identificação */}
        <motion.section custom={2} initial="hidden" animate="visible" variants={sectionVariants}>
          <SectionLabel>Identificação</SectionLabel>
          <div className="space-y-3">
            <FloatInput
              label="Título"
              value={titulo}
              onChange={setTitulo}
              required
            />
            <FloatInput
              label="Título original"
              value={tituloOriginal}
              onChange={setTituloOriginal}
            />
            <FloatInput
              label="Ano de lançamento"
              value={anoLancamento}
              onChange={setAnoLancamento}
              type="number"
              inputMode="numeric"
              required
            />
          </div>
        </motion.section>

        {/* Section 4 — Temporadas (série only) */}
        <AnimatePresence>
          {tipo === 'serie' && (
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

              <div className="space-y-4">
                <AnimatePresence>
                  {temporadas.map((t, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="relative rounded-2xl bg-zinc-950 p-4 ring-1 ring-violet-500/20"
                    >
                      {/* Header */}
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-[10px] font-bold text-violet-400">
                            {t.numero}
                          </span>
                          <span className="text-xs font-semibold text-zinc-500">
                            Temporada {t.numero}
                          </span>
                        </div>

                        <motion.button
                          type="button"
                          onClick={() => removeTemporada(index)}
                          whileTap={{ scale: 0.85 }}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-500 transition-colors hover:bg-red-500/20 hover:text-red-400"
                        >
                          <X size={13} />
                        </motion.button>
                      </div>

                      {/* Note inputs */}
                      <div
                        className={`grid gap-4 ${groupTipo === 'duo'
                          ? 'grid-cols-1 sm:grid-cols-2'
                          : 'grid-cols-1'
                          }`}
                      >
                        <div className="min-w-0 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4">
                          <NoteCounter
                            label={groupTipo === 'duo' ? 'Dele' : 'Nota'}
                            value={t.notaDele}
                            onChange={(v) =>
                              updateTemporadaField(index, 'notaDele', v)
                            }
                          />
                        </div>

                        {groupTipo === 'duo' && (
                          <div className="min-w-0 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4">
                            <NoteCounter
                              label="Dela"
                              value={t.notaDela}
                              onChange={(v) =>
                                updateTemporadaField(index, 'notaDela', v)
                              }
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <motion.button
                  type="button"
                  onClick={addTemporada}
                  whileTap={{ scale: 0.97 }}
                  className="w-full rounded-2xl border border-dashed border-zinc-800 py-4 text-sm font-medium text-zinc-500 transition-colors hover:border-violet-500/40 hover:text-violet-400"
                >
                  + Adicionar temporada
                </motion.button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Section 5 — Notas (filme/livro + assistido) */}
        <AnimatePresence>
          {shouldShowNotas && (
            <motion.section
              key="notas"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <SectionLabel>
                <Star size={10} className="mr-1 inline -mt-0.5" />
                Notas
              </SectionLabel>

              <div
                className={`grid gap-4 ${groupTipo === 'duo' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
                  }`}
              >
                <div className="min-w-0 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4">
                  <NoteCounter
                    label={groupTipo === 'duo' ? 'Dele' : 'Minha nota'}
                    value={notaDele}
                    onChange={setNotaDele}
                  />
                </div>

                {groupTipo === 'duo' && (
                  <div className="min-w-0 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4">
                    <NoteCounter
                      label="Dela"
                      value={notaDela}
                      onChange={setNotaDela}
                    />
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Section 5 — Detalhes */}
        <motion.section
          custom={3}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <SectionLabel>Detalhes</SectionLabel>

          <div className="space-y-3">
            <FloatInput
              label="Data assistida"
              value={dataAssistida}
              onChange={setDataAssistida}
              type="date"
            />

            <PosterInput
              value={posterUrl}
              onChange={setPosterUrl}
            />

            <FloatTextarea
              label="Observações"
              value={observacoes}
              onChange={setObservacoes}
            />
          </div>
        </motion.section>

        {/* Section 6 — Gêneros */}
        {generos.length > 0 && (
          <motion.section custom={4} initial="hidden" animate="visible" variants={sectionVariants}>
            <SectionLabel>Gêneros</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {generos.map((genero, i) => {
                const active = generosIds.includes(genero.id);
                return (
                  <motion.button
                    key={genero.id}
                    type="button"
                    onClick={() => toggleGenero(genero.id)}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.03, duration: 0.2 } }}
                    style={{
                      backgroundColor: active ? 'rgb(236 72 153)' : 'rgb(24 24 27)',
                      color: active ? 'white' : 'rgb(113 113 122)',
                      borderColor: active ? 'rgb(236 72 153)' : 'rgb(63 63 70)',
                    }}
                    className="rounded-full border px-3.5 py-2 text-sm font-medium transition-shadow duration-200"
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
            </div>
          </motion.section>
        )}
      </form>

      {/* ── Sticky submit footer ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-5 pb-8 pt-4"
        style={{
          background: 'linear-gradient(to top, rgb(0,0,0) 70%, transparent)',
          paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
        }}
      >
        <AnimatePresence>
          {errorMessage && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="mb-2 text-center text-sm text-red-400"
            >
              {errorMessage}
            </motion.p>
          )}
          {successMessage && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="mb-2 flex items-center justify-center gap-1.5 text-center text-sm text-emerald-400"
            >
              <Check size={14} />
              {successMessage}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          form="watch-item-form"
          disabled={mutation.isPending}
          whileTap={!mutation.isPending ? { scale: 0.97 } : {}}
          className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-pink-500 py-4 text-sm font-bold text-white shadow-lg shadow-pink-500/25 transition-opacity disabled:opacity-60"
        >
          {mutation.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Check size={16} />
              <span>Salvar no acervo</span>
            </>
          )}
          {/* Shimmer on idle */}
          {!mutation.isPending && (
            <motion.div
              className="pointer-events-none absolute inset-0"
              animate={{
                background: [
                  'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)',
                  'linear-gradient(105deg, transparent 60%, rgba(255,255,255,0.08) 80%, transparent 100%)',
                ],
                backgroundPositionX: ['-100%', '200%'],
              }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
            />
          )}
        </motion.button>
      </div>
    </div>
  );
}
