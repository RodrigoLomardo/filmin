'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTemporada } from '@/lib/api/temporadas';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type TemporadaInput = {
  numero: string;
  nota: string;
};

type CreateTemporadasFormProps = {
  watchItemId: string;
};

export function CreateTemporadasForm({
  watchItemId,
}: CreateTemporadasFormProps) {
  const queryClient = useQueryClient();

  const [temporadas, setTemporadas] = useState<TemporadaInput[]>([
    { numero: '1', nota: '' },
  ]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      for (const temporada of temporadas) {
        if (!temporada.numero || !temporada.nota) {
          continue;
        }

        await createTemporada({
          watchItemId,
          numero: Number(temporada.numero),
          nota: Number(temporada.nota),
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
    setTemporadas((prev) => [...prev, { numero: String(prev.length + 1), nota: '' }]);
  }

  function updateTemporada(index: number, field: keyof TemporadaInput, value: string) {
    setTemporadas((prev) =>
      prev.map((temporada, i) =>
        i === index ? { ...temporada, [field]: value } : temporada,
      ),
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
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Cadastrar temporadas</h2>
        <p className="text-sm text-zinc-400">
          Adicione a nota de cada temporada da série.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {temporadas.map((temporada, index) => (
          <div
            key={`${index}-${temporada.numero}`}
            className="grid grid-cols-1 gap-3 rounded-2xl border border-zinc-800 p-4 md:grid-cols-[1fr_1fr_auto]"
          >
            <Input
              type="number"
              min="1"
              placeholder="Número da temporada"
              value={temporada.numero}
              onChange={(e) =>
                updateTemporada(index, 'numero', e.target.value)
              }
            />

            <Input
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="Nota"
              value={temporada.nota}
              onChange={(e) => updateTemporada(index, 'nota', e.target.value)}
            />

            <Button
              type="button"
              className="bg-zinc-800 text-white"
              onClick={() => removeTemporada(index)}
              disabled={temporadas.length === 1}
            >
              Remover
            </Button>
          </div>
        ))}

        <div className="flex flex-wrap gap-3">
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
        </div>

        {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}
        {successMessage && (
          <p className="text-sm text-green-400">{successMessage}</p>
        )}
      </form>
    </Card>
  );
}