'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLeaderboard } from '@/lib/hooks/use-leaderboard';
import { LeaderboardRankCard } from '@/components/achievements/leaderboard-rank-card';
import type { LeaderboardCategory } from '@/types/achievement';

const CATEGORY_META: Record<LeaderboardCategory, { nome: string; icone: string; unidade: string }> = {
  cinefilo:     { nome: 'Cinéfilo',      icone: '🎬', unidade: 'filmes' },
  maratonista:  { nome: 'Maratonista',   icone: '📺', unidade: 'séries' },
  leitor_avido: { nome: 'Leitor Ávido',  icone: '📚', unidade: 'livros' },
  colecionador: { nome: 'Colecionador',  icone: '🏆', unidade: 'itens'  },
  alma_gemea:   { nome: 'Alma Gêmea',    icone: '💖', unidade: 'notas idênticas' },
};

const VALID_CATEGORIES: LeaderboardCategory[] = [
  'cinefilo', 'maratonista', 'leitor_avido', 'colecionador', 'alma_gemea',
];

export default function LeaderboardPage() {
  const router = useRouter();
  const params = useParams();
  const rawCategory = params.category as string;
  const category = VALID_CATEGORIES.includes(rawCategory as LeaderboardCategory)
    ? (rawCategory as LeaderboardCategory)
    : 'cinefilo';

  const meta = CATEGORY_META[category];
  const { data: entries, isLoading } = useLeaderboard(category);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 px-4 py-4"
        style={{
          background: 'rgba(5,5,5,0.9)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-300"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-pink-500" />
          <h1 className="text-sm font-semibold text-white">
            TOP 10 · {meta.nome}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Hero card */}
        <motion.div
          className="mb-6 rounded-2xl p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(255,46,166,0.08), rgba(168,85,247,0.08))',
            border: '1px solid rgba(255,46,166,0.15)',
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,46,166,0.2), rgba(168,85,247,0.2))',
              }}
            >
              {meta.icone}
            </div>
            <div>
              <p className="text-base font-bold text-white">{meta.nome}</p>
              <p className="text-[11px] text-zinc-500">
                Top 10 usuários com mais {meta.unidade}
              </p>
            </div>
          </div>
        </motion.div>

        {/* List */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : !entries || entries.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((entry, i) => (
              <LeaderboardRankCard
                key={entry.rank}
                entry={entry}
                unidade={meta.unidade}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{ border: '1px solid rgba(39,39,42,0.6)', background: 'rgba(18,18,20,0.6)' }}
        >
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-zinc-800/60" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-32 animate-pulse rounded bg-zinc-800/60" />
            <div className="h-2.5 w-20 animate-pulse rounded bg-zinc-800/40" />
          </div>
          <div className="h-4 w-12 animate-pulse rounded bg-zinc-800/50" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      className="flex flex-col items-center gap-3 py-16 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <span className="text-4xl">🏜️</span>
      <p className="text-sm font-medium text-zinc-400">Nenhum dado ainda</p>
      <p className="text-xs text-zinc-600">Seja o primeiro a conquistar esse ranking!</p>
    </motion.div>
  );
}
