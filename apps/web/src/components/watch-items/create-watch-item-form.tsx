'use client';

import { FormEvent, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getGeneros } from '@/lib/api/generos';
import { createWatchItem } from '@/lib/api/watch-items';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { WatchItemStatus, WatchItemTipo } from '@/types/watch-item';

const statusOptions: WatchItemStatus[] = [
  'quero_assistir',
  'assistindo',
  'assistido',
  'abandonado',
];

const tipoOptions: WatchItemTipo[] = ['filme', 'serie', 'livro'];

const formFields = [
  'titulo', 'tituloOriginal', 'ano', 'tipo', 'status', 'notas',
  'dataAssistida', 'posterUrl', 'observacoes', 'generos', 'submit',
];

export function CreateWatchItemForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [titulo, setTitulo] = useState('');
  const [tituloOriginal, setTituloOriginal] = useState('');
  const [anoLancamento, setAnoLancamento] = useState('');
  const [tipo, setTipo] = useState<WatchItemTipo>('filme');
  const [status, setStatus] = useState<WatchItemStatus>('assistido');
  const [notaDele, setNotaDele] = useState('');
  const [notaDela, setNotaDela] = useState('');
  const [dataAssistida, setDataAssistida] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [generosIds, setGenerosIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { data: generos = [] } = useQuery({
    queryKey: ['generos'],
    queryFn: getGeneros,
  });

  const mutation = useMutation({
    mutationFn: createWatchItem,
    onSuccess: (createdItem) => {
      queryClient.invalidateQueries({ queryKey: ['watch-items'] });
      setErrorMessage('');

      if (createdItem.tipo === 'serie') {
        router.push(`/series/${createdItem.id}/temporadas`);
        return;
      }

      setSuccessMessage('Item cadastrado com sucesso.');
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
    },
    onError: (error: Error) => {
      setSuccessMessage('');
      setErrorMessage(error.message);
    },
  });

  const shouldShowNotas = useMemo(
    () => (tipo === 'filme' || tipo === 'livro') && status === 'assistido',
    [tipo, status],
  );

  function toggleGenero(id: string) {
    setGenerosIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Card className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: 'easeOut' }}
        >
          <h2 className="text-lg font-semibold">Cadastrar item</h2>
          <p className="text-sm text-zinc-400">
            Cadastre um filme, série ou livro no Filmin.
          </p>
        </motion.div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {formFields.map((field, index) => {
            const delay = 0.08 + index * 0.04;

            if (field === 'titulo') return (
              <motion.div key="titulo" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay, ease: 'easeOut' }}>
                <Input placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
              </motion.div>
            );

            if (field === 'tituloOriginal') return (
              <motion.div key="tituloOriginal" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay, ease: 'easeOut' }}>
                <Input placeholder="Título original" value={tituloOriginal} onChange={(e) => setTituloOriginal(e.target.value)} />
              </motion.div>
            );

            if (field === 'ano') return (
              <motion.div key="ano" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay, ease: 'easeOut' }}>
                <Input type="number" placeholder="Ano de lançamento" value={anoLancamento} onChange={(e) => setAnoLancamento(e.target.value)} required />
              </motion.div>
            );

            if (field === 'tipo') return (
              <motion.div key="tipo" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay, ease: 'easeOut' }}>
                <Select value={tipo} onChange={(e) => setTipo(e.target.value as WatchItemTipo)}>
                  {tipoOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </Select>
              </motion.div>
            );

            if (field === 'status') return (
              <motion.div key="status" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay, ease: 'easeOut' }}>
                <Select value={status} onChange={(e) => setStatus(e.target.value as WatchItemStatus)}>
                  {statusOptions.map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}
                </Select>
              </motion.div>
            );

            if (field === 'notas') return (
              <AnimatePresence key="notas">
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
            );

            if (field === 'dataAssistida') return (
              <motion.div key="dataAssistida" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay, ease: 'easeOut' }}>
                <Input type="date" value={dataAssistida} onChange={(e) => setDataAssistida(e.target.value)} />
              </motion.div>
            );

            if (field === 'posterUrl') return (
              <motion.div key="posterUrl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay, ease: 'easeOut' }}>
                <Input placeholder="Poster URL" value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} />
              </motion.div>
            );

            if (field === 'observacoes') return (
              <motion.div key="observacoes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay, ease: 'easeOut' }}>
                <Input placeholder="Observações" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
              </motion.div>
            );

            if (field === 'generos') return (
              <motion.div key="generos" className="space-y-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay, ease: 'easeOut' }}>
                <p className="text-sm font-medium">Gêneros</p>
                <div className="flex flex-wrap gap-2">
                  {generos.map((genero) => {
                    const active = generosIds.includes(genero.id);
                    return (
                      <button
                        type="button"
                        key={genero.id}
                        onClick={() => toggleGenero(genero.id)}
                        className={`rounded-full border px-3 py-2 text-sm transition ${active ? 'border-pink-500 bg-pink-500 text-white' : 'border-zinc-700 bg-zinc-900 text-zinc-300'}`}
                      >
                        {genero.nome}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );

            if (field === 'submit') return (
              <motion.div key="submit" className="space-y-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay, ease: 'easeOut' }}>
                {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}
                {successMessage && <p className="text-sm text-green-400">{successMessage}</p>}
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Salvando...' : 'Salvar item'}
                </Button>
              </motion.div>
            );

            return null;
          })}
        </form>
      </Card>
    </motion.div>
  );
}