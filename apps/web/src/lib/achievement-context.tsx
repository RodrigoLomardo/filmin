'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { checkAchievements } from '@/lib/api/achievements';
import { AchievementUnlockedModal } from '@/components/achievements/achievement-unlocked-modal';
import type { Achievement } from '@/types/achievement';

interface AchievementContextValue {
  triggerCheck: () => void;
}

const AchievementContext = createContext<AchievementContextValue>({
  triggerCheck: () => {},
});

export function AchievementProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  const triggerCheck = useCallback(async () => {
    try {
      const delta = await checkAchievements();
      if (delta.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['achievements'] });
        setNewAchievements(delta);
      }
    } catch {
      // silencia erros — não crítico
    }
  }, [queryClient]);

  return (
    <AchievementContext.Provider value={{ triggerCheck }}>
      {children}
      {newAchievements.length > 0 && (
        <AchievementUnlockedModal
          achievements={newAchievements}
          onClose={() => setNewAchievements([])}
        />
      )}
    </AchievementContext.Provider>
  );
}

export function useAchievementCheck() {
  return useContext(AchievementContext).triggerCheck;
}
