'use client';

import { useMemo } from 'react';
import type { Achievement } from '@/types/achievement';
import { AchievementBadge } from './achievement-badge';

interface AchievementGridProps {
  achievements: Achievement[];
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Para conquistas com levelGroup:
 * - Se alguma está desbloqueada → mostra só a mais alta desbloqueada
 * - Se nenhuma está desbloqueada → mostra o nível 1 (menor) com progresso
 */
function filterForDisplay(achievements: Achievement[]): Achievement[] {
  const grouped = new Map<string, Achievement[]>();
  const singles: Achievement[] = [];

  for (const a of achievements) {
    if (a.levelGroup) {
      const arr = grouped.get(a.levelGroup) ?? [];
      arr.push(a);
      grouped.set(a.levelGroup, arr);
    } else {
      singles.push(a);
    }
  }

  const result: Achievement[] = [];

  for (const [, group] of grouped) {
    const sorted = [...group].sort((a, b) => (b.level ?? 0) - (a.level ?? 0));
    const highestUnlocked = sorted.find((a) => a.unlocked);

    if (highestUnlocked) {
      result.push(highestUnlocked);
    } else {
      // Mostra o nível 1 com progresso
      const lowestLocked = sorted[sorted.length - 1];
      result.push(lowestLocked);
    }
  }

  return [...result, ...singles];
}

export function AchievementGrid({ achievements, size = 'md' }: AchievementGridProps) {
  const display = useMemo(() => filterForDisplay(achievements), [achievements]);

  const unlocked = display.filter((a) => a.unlocked);
  const locked = display.filter((a) => !a.unlocked);

  return (
    <div className="flex flex-col gap-6">
      {unlocked.length > 0 && (
        <section>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-pink-500">
            Conquistadas · {unlocked.length}
          </p>
          <div className="grid grid-cols-4 gap-4 sm:grid-cols-5">
            {unlocked.map((a, i) => (
              <AchievementBadge key={a.slug} achievement={a} size={size} delay={i * 0.04} />
            ))}
          </div>
        </section>
      )}

      {locked.length > 0 && (
        <section>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Não conquistadas · {locked.length}
          </p>
          <div className="grid grid-cols-4 gap-4 sm:grid-cols-5">
            {locked.map((a, i) => (
              <AchievementBadge
                key={a.slug}
                achievement={a}
                size={size}
                showProgress
                delay={i * 0.03}
              />
            ))}
          </div>
        </section>
      )}

      {unlocked.length === 0 && locked.length === 0 && (
        <p className="text-center text-sm text-zinc-600 py-8">Nenhuma conquista disponível.</p>
      )}
    </div>
  );
}
