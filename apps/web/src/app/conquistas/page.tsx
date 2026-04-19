'use client';

import { ArrowLeft, Trophy, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAchievements } from '@/lib/hooks/use-achievements';
import { AchievementGrid } from '@/components/achievements/achievement-grid';
import type { LeaderboardCategory } from '@/types/achievement';

const LEADERBOARD_CATEGORIES: { slug: LeaderboardCategory; nome: string; icone: string }[] = [
  { slug: 'cinefilo',     nome: 'Cinéfilo',     icone: '🎬' },
  { slug: 'maratonista',  nome: 'Maratonista',  icone: '📺' },
  { slug: 'leitor_avido', nome: 'Leitor Ávido', icone: '📚' },
  { slug: 'colecionador', nome: 'Colecionador', icone: '🏆' },
  { slug: 'alma_gemea',   nome: 'Alma Gêmea',   icone: '💖' },
];

export default function ConquistasPage() {
  const router = useRouter();
  const { data: achievements, isLoading } = useAchievements();

  const unlocked = achievements?.filter((a) => a.unlocked) ?? [];
  // Para exibição de totais conta apenas "grupos" visíveis (sem duplicar níveis)
  const uniqueGroups = achievements
    ? new Set(achievements.map((a) => a.levelGroup ?? a.slug)).size
    : 0;

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
          <h1 className="text-sm font-semibold text-white">Conquistas</h1>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Contador */}
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
              className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,46,166,0.2), rgba(168,85,247,0.2))',
              }}
            >
              🏆
            </div>
            <div>
              <p className="text-lg font-bold text-white">
                {unlocked.length}
                <span className="text-sm font-normal text-zinc-500"> / {uniqueGroups}</span>
              </p>
              <p className="text-[11px] text-zinc-500">conquistas desbloqueadas</p>
            </div>
            {/* Barra de progresso geral */}
            <div className="ml-auto flex-1 max-w-[100px]">
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #ff2ea6, #a855f7)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${uniqueGroups > 0 ? (unlocked.length / uniqueGroups) * 100 : 0}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                />
              </div>
            </div>
          </div>
        </motion.div>




        {/* Grid */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : achievements ? (
          <AchievementGrid achievements={achievements} size="md" />
        ) : null}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <div className="w-20 h-20 rounded-2xl bg-zinc-800/50 animate-pulse" />
          <div className="w-14 h-2.5 rounded bg-zinc-800/50 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
