'use client';

import { FormEvent, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getGeneros } from '@/lib/api/generos';
import { updateWatchItem } from '@/lib/api/watch-items';
import { createTemporada, updateTemporada } from '@/lib/api/temporadas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { WatchItem, WatchItemStatus, WatchItemTipo } from '@/types/watch-item';
import { X } from 'lucide-react';

const statusOptions: WatchItemStatus[] = [
  'quero_assistir', 'assistindo', 'assistido', 'abandonado',
];

type EditWatchItemFormProps = {
  item: WatchItem;
  onSuccess: () => void;
};

export function EditWatchItemForm({ item, onSuccess }: EditWatchItemFormProps) {
  const queryClient = useQueryClient();

  const [titulo, setTitulo] = useState(item.titulo);
  const [tituloOriginal, setTituloOriginal] = useState(item.tituloOriginal ?? '');
  const [anoLancamento, setAnoLancamento] = useState(String(item.anoLancamento));
  const [status, setStatus] = useState<WatchItemStatus>(item.status);
  const [notaDele, setNotaDele] = useState(String(item.notaDele ?? ''));
  const [notaDela, setNotaDela] = useState(String(item.notaDela ?? ''));
  const [dataAssistida, setDataAssistida] = useState(item.dataAssistida?.slice(0, 10) ?? '');
  const [observacoes, setObservacoes] = useState(item.observacoes ?? '');
  const [posterUrl, setPosterUrl] = useState(item.posterUrl ?? '');
  const [generosIds, setGenerosIds] = useState<string[]>(item.generos.map((g) => g.id));
  const [errorMessage, setErrorMessage] = useState('');

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
        anoLancamento: Number(anoLancamento),
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
      {
        id: '',
        numero: String(prev.length + 1),
        notaDele: '',
        notaDela: '',
        isNew: true,
      },
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
    mutation.mutate();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05 }}>
        <Input placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.08 }}>
        <Input placeholder="Título original" value={tituloOriginal} onChange={(e) => setTituloOriginal(e.target.value)} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.11 }}>
        <Input type="number" placeholder="Ano de lançamento" value={anoLancamento} onChange={(e) => setAnoLancamento(e.target.value)} required />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.14 }}>
        <Select value={status} onChange={(e) => setStatus(e.target.value as WatchItemStatus)}>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>
          ))}
        </Select>
      </motion.div>

      <AnimatePresence>
        {shouldShowNotas && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Input type="number" step="0.1" min="0" max="10" placeholder="Nota dele" value={notaDele} onChange={(e) => setNotaDele(e.target.value)} />
            <Input type="number" step="0.1" min="0" max="10" placeholder="Nota dela" value={notaDela} onChange={(e) => setNotaDela(e.target.value)} />
          </motion.div>
        )}
      </AnimatePresence>

      {isSerie && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.17 }}
        >
          <p className="text-sm font-medium text-zinc-300">Temporadas</p>
          <AnimatePresence>
            {temporadas.map((t, index) => (
              <motion.div
                key={`${t.id || 'new'}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
                className="relative grid grid-cols-[auto_1fr_1fr] gap-2 rounded-2xl border border-zinc-800 p-3"
              >
                {t.isNew && (
                  <button
                    type="button"
                    onClick={() => removeTemporada(index)}
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-zinc-400 transition hover:bg-red-500 hover:text-white"
                  >
                    <X size={10} />
                  </button>
                )}
                <div className="flex items-center justify-center rounded-xl bg-zinc-800 px-3 text-sm font-medium text-zinc-300">
                  T{t.numero}
                </div>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  placeholder="Nota dele"
                  value={t.notaDele}
                  onChange={(e) => updateTemporadaField(index, 'notaDele', e.target.value)}
                />
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  placeholder="Nota dela"
                  value={t.notaDela}
                  onChange={(e) => updateTemporadaField(index, 'notaDela', e.target.value)}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          <button
            type="button"
            onClick={addTemporada}
            className="w-full rounded-2xl border border-dashed border-zinc-700 py-3 text-sm text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-300"
          >
            + Adicionar temporada
          </button>
        </motion.div>
      )}

      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.2 }}
      >
        <Input type="date" value={dataAssistida} onChange={(e) => setDataAssistida(e.target.value)} />
        <Input placeholder="Poster URL" value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} />
        <Input placeholder="Observações" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
      </motion.div>

      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.23 }}
      >
        <p className="text-sm font-medium">Gêneros</p>
        <div className="flex flex-wrap gap-2">
          {generos.map((genero) => {
            const active = generosIds.includes(genero.id);
            return (
              <button
                type="button"
                key={genero.id}
                onClick={() => toggleGenero(genero.id)}
                className={`rounded-full border px-3 py-2 text-sm transition ${active ? 'border-pink-500 bg-pink-500 text-white' : 'border-zinc-700 bg-zinc-900 text-zinc-300'
                  }`}
              >
                {genero.nome}
              </button>
            );
          })}
        </div>
      </motion.div>

      {errorMessage && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400">
          {errorMessage}
        </motion.p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.26 }}
      >
        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </motion.div>
    </form>
  );
}