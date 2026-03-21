'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { WatchItem } from '@/types/watch-item';

type WatchItemCardProps = {
  item: WatchItem;
  index: number;
};

export function WatchItemCard({ item, index }: WatchItemCardProps) {
  const isFilme = item.tipo === 'filme';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: 'easeOut' }}
    >
      <Card className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{item.titulo}</h3>
            <p className="text-sm text-zinc-400">
              {item.tipo} • {item.anoLancamento}
            </p>
          </div>

          <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs capitalize">
            {item.status.replaceAll('_', ' ')}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {item.generos.map((genero) => (
            <span
              key={genero.id}
              className="rounded-full border border-zinc-700 px-2 py-1 text-xs text-zinc-300"
            >
              {genero.nome}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-zinc-300">
          <div className="flex gap-4">
            {isFilme ? (
              <>
                <span>Ele: {item.notaDele ?? '-'}</span>
                <span>Ela: {item.notaDela ?? '-'}</span>
                <span className="text-pink-400">Geral: {item.notaGeral ?? '-'}</span>
              </>
            ) : (
              <span className="text-pink-400">Geral: {item.notaGeral ?? '-'}</span>
            )}
          </div>
          <span>Rewatch: {item.rewatchCount}</span>
        </div>
      </Card>
    </motion.div>
  );
}