'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import { useTmdbSearch } from '@/lib/hooks/use-tmdb-search';
import { TmdbResultItem } from './tmdb-result-item';
import type { TmdbResult } from '@/types/tmdb';
import type { WatchItemTipo } from '@/types/watch-item';

interface TmdbSearchProps {
  tipo: WatchItemTipo;
  onSelect: (result: TmdbResult) => void;
}

export function TmdbSearch({ tipo, onSelect }: TmdbSearchProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setOpen(debouncedQuery.trim().length > 2);
  }, [debouncedQuery]);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: results = [], isFetching } = useTmdbSearch(debouncedQuery, tipo);

  function handleSelect(result: TmdbResult) {
    onSelect(result);
    setQuery('');
    setOpen(false);
  }

  function handleClear() {
    setQuery('');
    setDebouncedQuery('');
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}
      <div className="flex items-center gap-3 rounded-2xl bg-zinc-900 px-4 py-3 ring-1 ring-zinc-800 focus-within:ring-pink-500 transition-all duration-200">
        {isFetching ? (
          <Loader2 size={16} className="flex-shrink-0 animate-spin text-pink-500" />
        ) : (
          <Search size={16} className="flex-shrink-0 text-zinc-500" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tipo === 'filme' ? 'Buscar filme no TMDB...' : 'Buscar série no TMDB...'}
          className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 outline-none"
        />
        <AnimatePresence>
          {query && (
            <motion.button
              type="button"
              onClick={handleClear}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.15 }}
              className="flex-shrink-0 text-zinc-600 hover:text-zinc-400"
            >
              <X size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl bg-zinc-900 shadow-xl ring-1 ring-white/8"
          >
            {results.length === 0 && !isFetching && (
              <p className="px-4 py-5 text-center text-sm text-zinc-600">
                Nenhum resultado encontrado
              </p>
            )}
            <div className="max-h-64 overflow-y-auto py-1">
              {results.map((result) => (
                <TmdbResultItem
                  key={result.tmdbId}
                  result={result}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
