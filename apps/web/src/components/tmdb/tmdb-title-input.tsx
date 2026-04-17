'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useTmdbSearch } from '@/lib/hooks/use-tmdb-search';
import { TmdbResultItem } from './tmdb-result-item';
import type { TmdbResult } from '@/types/tmdb';
import type { WatchItemTipo } from '@/types/watch-item';

interface TmdbTitleInputProps {
  tipo: WatchItemTipo;
  value: string;
  onChange: (v: string) => void;
  onSelect: (result: TmdbResult) => void;
  required?: boolean;
}

export function TmdbTitleInput({ tipo, value, onChange, onSelect, required }: TmdbTitleInputProps) {
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const justSelectedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchEnabled = tipo !== 'livro';

  // Debounce 300ms — ignora a primeira mudança após uma seleção
  useEffect(() => {
    if (!searchEnabled) return;
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }
    const t = setTimeout(() => setDebouncedQuery(value), 300);
    return () => clearTimeout(t);
  }, [value, searchEnabled]);

  useEffect(() => {
    if (!searchEnabled) return;
    setOpen(debouncedQuery.trim().length > 2);
  }, [debouncedQuery, searchEnabled]);

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

  const { data: results = [], isFetching } = useTmdbSearch(
    searchEnabled ? debouncedQuery : '',
    tipo,
  );

  const floated = focused || value !== '';

  function handleChange(v: string) {
    justSelectedRef.current = false;
    onChange(v);
  }

  function handleSelect(result: TmdbResult) {
    justSelectedRef.current = true;
    setOpen(false);
    setDebouncedQuery('');
    onSelect(result);
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`relative rounded-2xl bg-zinc-900 transition-all duration-200 ${
          focused
            ? 'ring-2 ring-pink-500'
            : 'ring-1 ring-zinc-800 hover:ring-zinc-700'
        }`}
      >
        <motion.label
          animate={{
            top: floated ? '8px' : '50%',
            y: floated ? '0%' : '-50%',
            fontSize: floated ? '10px' : '14px',
            color: focused
              ? 'rgb(236 72 153)'
              : floated
                ? 'rgb(113 113 122)'
                : 'rgb(82 82 91)',
            letterSpacing: floated ? '0.1em' : '0',
          }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="pointer-events-none absolute left-4 z-10 font-semibold uppercase leading-none"
        >
          Título
          {required && <span className="ml-0.5 text-pink-500">*</span>}
        </motion.label>

        <div className="flex items-center">
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            required={required}
            className="w-full rounded-2xl bg-transparent px-4 pb-3.5 pt-7 text-sm text-white outline-none"
          />
          {searchEnabled && isFetching && (
            <Loader2 size={14} className="mr-4 flex-shrink-0 animate-spin text-pink-500" />
          )}
        </div>
      </div>

      {/* Dropdown de sugestões TMDB */}
      <AnimatePresence>
        {open && searchEnabled && (
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
