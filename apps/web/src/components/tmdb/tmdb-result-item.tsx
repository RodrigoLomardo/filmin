'use client';

import { motion } from 'framer-motion';
import type { TmdbResult } from '@/types/tmdb';

interface TmdbResultItemProps {
  result: TmdbResult;
  onSelect: (result: TmdbResult) => void;
}

export function TmdbResultItem({ result, onSelect }: TmdbResultItemProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(result)}
      whileTap={{ scale: 0.98 }}
      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-zinc-800/60"
    >
      <div className="h-12 w-8 flex-shrink-0 overflow-hidden rounded-md bg-zinc-800">
        {result.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={result.posterUrl}
            alt={result.titulo}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-600">
            {result.tipo === 'filme' ? '🎬' : '📺'}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{result.titulo}</p>
        {result.tituloOriginal !== result.titulo && (
          <p className="truncate text-[11px] text-zinc-500">{result.tituloOriginal}</p>
        )}
      </div>

      {result.anoLancamento && (
        <span className="flex-shrink-0 text-xs text-zinc-600">{result.anoLancamento}</span>
      )}
    </motion.button>
  );
}
