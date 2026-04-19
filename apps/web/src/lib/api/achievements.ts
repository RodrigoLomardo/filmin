import { apiFetch } from './client';
import type { Achievement, LeaderboardEntry, LeaderboardCategory } from '@/types/achievement';

export async function getAchievements(): Promise<Achievement[]> {
  return apiFetch<Achievement[]>('/achievements');
}

export async function checkAchievements(): Promise<Achievement[]> {
  return apiFetch<Achievement[]>('/achievements/check', { method: 'POST' });
}

export async function getPublicAchievements(profileId: string): Promise<Achievement[]> {
  return apiFetch<Achievement[]>(`/achievements/public/${profileId}`);
}

export async function getLeaderboard(category: LeaderboardCategory): Promise<LeaderboardEntry[]> {
  return apiFetch<LeaderboardEntry[]>(`/achievements/leaderboard/${category}`);
}
