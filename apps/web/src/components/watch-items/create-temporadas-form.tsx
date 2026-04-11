'use client';

import { FormEvent, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTemporada } from '@/lib/api/temporadas';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type TemporadaInput = {
  numero: string;
  notaDele: string;
  notaDela: string;
};

type CreateTemporadasFormProps = {
  watchItemId: string;
};

export function CreateTemporadasForm({ watchItemId }: CreateTemporadasFormProps) {
  const queryClient = useQueryClient();

  const [temporadas, setTemporadas] = useState<TemporadaInput[]>([
    { numero: '1', notaDele: '', notaDela: '' },
  ]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      for (const temporada of temporadas) {
        if (!temporada.numero || !temporada.notaDele || !temporada.notaDela) continue;
        await createTemporada({
          watchItemId,
          numero: Number(temporada.numero),
          notaDele: Number(temporada.notaDele),
          notaDela: Number(temporada.notaDela),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watch-items'] });
      setSuccessMessage('Temporadas cadastradas com sucesso.');
      setErrorMessage('');
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

  function updateTemporada(index: number, field: keyof TemporadaInput, value: string) {
    setTemporadas((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)),
    );
  }

  function removeTemporada(index: number) {
    setTemporadas((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    mutation.mutate();
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
          <h2 className="text-lg font-semibold">Cadastrar temporadas</h2>
          <p className="text-sm text-zinc-400">
            Adicione as notas de cada temporada da série.
          </p>
        </motion.div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <AnimatePresence>
            {temporadas.map((temporada, index) => (
              <motion.div
                key={`${index}-${temporada.numero}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05, ease: 'easeOut' }}
                className="grid grid-cols-1 gap-3 rounded-2xl border border-zinc-800 p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <Input
                  type="number"
                  min="1"
                  placeholder="Nº da temporada"
                  value={temporada.numero}
                  onChange={(e) => updateTemporada(index, 'numero', e.target.value)}
                />
                <Input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="Nota dele"
                  value={temporada.notaDele}
                  onChange={(e) => updateTemporada(index, 'notaDele', e.target.value)}
                />
                <Input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="Nota dela"
                  value={temporada.notaDela}
                  onChange={(e) => updateTemporada(index, 'notaDela', e.target.value)}
                />
                <Button
                  type="button"
                  className="bg-zinc-800 text-white"
                  onClick={() => removeTemporada(index)}
                  disabled={temporadas.length === 1}
                >
                  Remover
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.2, ease: 'easeOut' }}
          >
            <Button
              type="button"
              className="bg-zinc-800 text-white"
              onClick={addTemporada}
            >
              Adicionar temporada
            </Button>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : 'Salvar temporadas'}
            </Button>
          </motion.div>

          {errorMessage && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-400"
            >
              {errorMessage}
            </motion.p>
          )}
          {successMessage && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-green-400"
            >
              {successMessage}
            </motion.p>
          )}
        </form>
      </Card>
    </motion.div>
  );
}