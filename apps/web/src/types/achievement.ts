export type AchievementEscopo = 'solo_duo' | 'duo_only';

export interface Achievement {
  slug: string;
  nome: string;
  descricao: string;
  icone: string;
  escopo: AchievementEscopo;
  levelGroup?: string;
  level?: number;
  unlocked: boolean;
  unlockedAt: string | null;
  progress?: { current: number; target: number };
}

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  value: number;
  highestLevel: number | null;
  profileIds: string[];
}

export type LeaderboardCategory = 'cinefilo' | 'maratonista' | 'leitor_avido' | 'colecionador' | 'alma_gemea';

export interface LeaderboardCategoryMeta {
  slug: LeaderboardCategory;
  nome: string;
  icone: string;
  unidade: string;
}
