'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Lock, Users, User, Globe } from 'lucide-react';
import { searchProfiles } from '@/lib/api/social-profile';
import type { SearchProfileResult } from '@/types/social-profile';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function profileDisplayName(p: SearchProfileResult): string {
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ');
  return name || p.email?.split('@')[0] || 'Usuário';
}

function profileInitial(p: SearchProfileResult): string {
  return (p.firstName?.[0] ?? p.email?.[0] ?? 'U').toUpperCase();
}

// ---------------------------------------------------------------------------
// PrivateProfileModal
// ---------------------------------------------------------------------------

function PrivateProfileModal({
  profile,
  onClose,
}: {
  profile: SearchProfileResult;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          className="relative z-10 w-full max-w-xs overflow-hidden rounded-2xl"
          style={{
            background: 'rgba(11,11,12,0.97)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: 'inset 0 1px 0 rgba(255,46,166,0.1), 0 24px 64px rgba(0,0,0,0.6)',
          }}
          initial={{ opacity: 0, scale: 0.88, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 10 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        >
          <div className="flex flex-col items-center gap-4 px-6 py-8">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: 'rgba(255,46,166,0.08)', border: '1px solid rgba(255,46,166,0.15)' }}
            >
              <Lock size={28} className="text-pink-500" />
            </div>

            <div className="text-center">
              <p className="text-base font-semibold text-white">Perfil privado</p>
              <p className="mt-1 text-[13px] text-zinc-500">
                <span className="text-zinc-300">{profileDisplayName(profile)}</span> escolheu manter
                seu perfil privado.
              </p>
            </div>

            <button
              onClick={onClose}
              className="mt-1 w-full rounded-xl py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-zinc-200"
            >
              Voltar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// ResultCard
// ---------------------------------------------------------------------------

function ResultCard({
  profile,
  onClick,
}: {
  profile: SearchProfileResult;
  onClick: () => void;
}) {
  return (
    <motion.button
      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
      whileHover={{ background: 'rgba(255,255,255,0.05)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Avatar */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-[1.5px]"
        style={{ background: 'linear-gradient(135deg, #ff2ea6, #a855f7)' }}
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-950">
          <span className="text-sm font-semibold text-white">{profileInitial(profile)}</span>
        </div>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">
          {profileDisplayName(profile)}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          {profile.groupTipo && (
            <div
              className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5"
              style={{ background: 'rgba(255,46,166,0.08)', border: '1px solid rgba(255,46,166,0.14)' }}
            >
              <Users size={8} className="text-pink-500" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-pink-500">
                {profile.groupTipo}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Privacy badge */}
      <div className="shrink-0">
        {profile.isPrivate ? (
          <Lock size={13} className="text-zinc-600" />
        ) : (
          <Globe size={13} className="text-zinc-700" />
        )}
      </div>
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// SearchPage
// ---------------------------------------------------------------------------

export default function SearchPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchProfileResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [privateProfile, setPrivateProfile] = useState<SearchProfileResult | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchProfiles(query.trim());
        setResults(data);
        setSearched(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 380);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleResultClick(profile: SearchProfileResult) {
    if (profile.isPrivate) {
      setPrivateProfile(profile);
    } else {
      router.push(`/perfil/${profile.id}`);
    }
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl px-4 pt-10 pb-24">
      {/* Header */}
      <motion.div
        className="mb-8 flex items-center gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800/70 text-zinc-400 transition hover:bg-zinc-700 hover:text-white ring-1 ring-white/[0.06]"
          aria-label="Voltar"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-white">Buscar pessoas</h1>
          <p className="text-[11px] text-zinc-600">Encontre outros usuários pelo nome</p>
        </div>
      </motion.div>

      {/* Search input */}
      <motion.div
        className="relative mb-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08, ease: 'easeOut' }}
      >
        <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
          <Search size={15} className="text-zinc-500" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nome ou usuário..."
          className="w-full rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.border = '1px solid rgba(255,46,166,0.3)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)';
          }}
        />
        {loading && (
          <div className="absolute inset-y-0 right-3.5 flex items-center">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-700 border-t-pink-500" />
          </div>
        )}
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {query.trim().length < 2 ? (
          <motion.div
            key="hint"
            className="mt-12 flex flex-col items-center gap-3 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <User size={20} className="text-zinc-700" />
            </div>
            <p className="text-sm text-zinc-600">Digite pelo menos 2 caracteres para buscar</p>
          </motion.div>
        ) : searched && results.length === 0 && !loading ? (
          <motion.div
            key="empty"
            className="mt-12 flex flex-col items-center gap-3 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <Search size={20} className="text-zinc-700" />
            </div>
            <p className="text-sm text-zinc-600">
              Nenhum usuário encontrado para{' '}
              <span className="text-zinc-400">&ldquo;{query}&rdquo;</span>
            </p>
          </motion.div>
        ) : results.length > 0 ? (
          <motion.div
            key="results"
            className="flex flex-col gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
            </p>
            {results.map((profile, i) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
              >
                <ResultCard profile={profile} onClick={() => handleResultClick(profile)} />
              </motion.div>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Private profile modal */}
      {privateProfile && (
        <PrivateProfileModal
          profile={privateProfile}
          onClose={() => setPrivateProfile(null)}
        />
      )}
    </div>
  );
}
