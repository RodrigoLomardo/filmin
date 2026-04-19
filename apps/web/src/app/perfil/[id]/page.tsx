'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Film,
  Tv,
  BookOpen,
  Users,
  User,
  Heart,
} from 'lucide-react';
import { getPublicProfile } from '@/lib/api/social-profile';
import { StreakFire } from '@/components/streak/streak-fire';
import type { PublicProfile, RecentWatchedItem } from '@/types/social-profile';
import { ApiError } from '@/lib/api/client';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function displayName(p: PublicProfile): string {
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ');
  return name || 'Usuário';
}

function getInitial(p: PublicProfile): string {
  return (p.firstName?.[0] ?? 'U').toUpperCase();
}

function typeLabel(tipo: string): string {
  if (tipo === 'filme') return 'Filme';
  if (tipo === 'serie') return 'Série';
  if (tipo === 'livro') return 'Livro';
  return tipo;
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-zinc-800/50 ${className ?? ''}`}
    />
  );
}

// ---------------------------------------------------------------------------
// WatchedItemCard
// ---------------------------------------------------------------------------

function WatchedItemCard({ item }: { item: RecentWatchedItem }) {
  return (
    <motion.div
      className="flex flex-col gap-1.5"
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.18 }}
    >
      {/* Poster */}
      <div
        className="relative overflow-hidden rounded-xl"
        style={{ aspectRatio: '2/3', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {item.posterUrl ? (
          <img
            src={item.posterUrl}
            alt={item.titulo}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            {item.tipo === 'filme' ? (
              <Film size={20} className="text-zinc-700" />
            ) : item.tipo === 'serie' ? (
              <Tv size={20} className="text-zinc-700" />
            ) : (
              <BookOpen size={20} className="text-zinc-700" />
            )}
          </div>
        )}
        {/* Nota overlay */}
        {item.notaGeral != null && (
          <div
            className="absolute bottom-1.5 right-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          >
            {item.notaGeral.toFixed(1)}
          </div>
        )}
      </div>
      {/* Title */}
      <p className="line-clamp-2 text-[11px] leading-tight text-zinc-500">{item.titulo}</p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// StatPill
// ---------------------------------------------------------------------------

function StatPill({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 py-4">
      <div className="mb-0.5 text-zinc-700">{icon}</div>
      <span className="text-[22px] font-light leading-none text-white">{value}</span>
      <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-700">
        {label}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PrivateProfileView
// ---------------------------------------------------------------------------

function PrivateProfileView({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 pt-24 text-center">
      <motion.div
        className="flex h-20 w-20 items-center justify-center rounded-full"
        style={{ background: 'rgba(255,46,166,0.06)', border: '1px solid rgba(255,46,166,0.12)' }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 24 }}
      >
        <span className="text-4xl">🔒</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <p className="text-base font-semibold text-white">Perfil privado</p>
        <p className="mt-1 text-sm text-zinc-600">
          Este usuário optou por manter seu perfil privado.
        </p>
      </motion.div>
      <motion.button
        className="mt-2 rounded-xl px-5 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.05] hover:text-zinc-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={onBack}
      >
        Voltar
      </motion.button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProfilePage
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;

  const { data: profile, isLoading, error } = useQuery<PublicProfile, ApiError>({
    queryKey: ['public-profile', profileId],
    queryFn: () => getPublicProfile(profileId),
    retry: false,
    staleTime: 30_000,
  });

  const isPrivate =
    error instanceof ApiError && error.message === 'PROFILE_PRIVATE';

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl px-4 pt-10 pb-24">
      {/* Back button */}
      <motion.button
        className="mb-8 flex items-center gap-2 text-zinc-500 transition hover:text-zinc-200"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        onClick={() => router.back()}
        aria-label="Voltar"
      >
        <ArrowLeft size={16} />
        <span className="text-sm font-medium">Voltar</span>
      </motion.button>

      {/* Private guard */}
      <AnimatePresence>
        {isPrivate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PrivateProfileView onBack={() => router.back()} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading skeleton */}
      {isLoading && !isPrivate && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-full animate-pulse rounded-xl bg-zinc-800/50" style={{ aspectRatio: '2/3' }} />
            ))}
          </div>
        </div>
      )}

      {/* Profile content */}
      {profile && !isPrivate && (
        <motion.div
          className="flex flex-col gap-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {/* ── Header ── */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full p-[2px]"
              style={{ background: 'linear-gradient(135deg, #ff2ea6, #a855f7)' }}
            >
              <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-950">
                <span className="text-lg font-semibold text-white">{getInitial(profile)}</span>
              </div>
            </div>

            {/* Name + badges */}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold text-white">
                {displayName(profile)}
              </h1>

              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {/* Group badge */}
                {profile.groupTipo && (
                  <div
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                    style={{ background: 'rgba(255,46,166,0.08)', border: '1px solid rgba(255,46,166,0.15)' }}
                  >
                    <Users size={9} className="text-pink-500" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-pink-500">
                      {profile.groupTipo}
                    </span>
                  </div>
                )}

                {/* Duo partner */}
                {profile.duoPartner && (
                  <div
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                    style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)' }}
                  >
                    <Heart size={8} className="text-purple-400" />
                    <span className="text-[9px] font-medium text-purple-400">
                      {[profile.duoPartner.firstName, profile.duoPartner.lastName]
                        .filter(Boolean)
                        .join(' ') || 'Parceiro'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Streak */}
            <div className="flex shrink-0 items-center gap-0.5">
              <StreakFire
                sequencia={profile.streakSequencia}
                isActive={profile.streakSequencia > 0}
                size={26}
              />
              <span className="text-sm font-semibold text-white tabular-nums">
                {profile.streakSequencia}
              </span>
            </div>
          </div>

          {/* ── Stats ── */}
          <div
            className="flex overflow-hidden rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <StatPill icon={<Film size={12} />} value={profile.stats.filmes} label="Filmes" />
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.05)', margin: '10px 0' }} />
            <StatPill icon={<Tv size={12} />} value={profile.stats.series} label="Séries" />
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.05)', margin: '10px 0' }} />
            <StatPill icon={<BookOpen size={12} />} value={profile.stats.livros} label="Livros" />
          </div>

          {/* ── Recent watched ── */}
          {profile.recentWatched.length > 0 ? (
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                Assistidos recentemente
              </p>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                {profile.recentWatched.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                  >
                    <WatchedItemCard item={item} />
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <User size={24} className="text-zinc-800" />
              <p className="text-sm text-zinc-700">Nenhum item assistido ainda.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
