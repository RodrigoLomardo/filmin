import { apiFetch } from './client';
import type {
  SearchProfileResult,
  PublicProfile,
  ProfileViewersResponse,
} from '@/types/social-profile';

export async function searchProfiles(q: string): Promise<SearchProfileResult[]> {
  return apiFetch<SearchProfileResult[]>(
    `/profiles/search?q=${encodeURIComponent(q)}`,
  );
}

export async function getPublicProfile(id: string): Promise<PublicProfile> {
  return apiFetch<PublicProfile>(`/profiles/${id}/public`);
}

export async function getMyViewers(): Promise<ProfileViewersResponse> {
  return apiFetch<ProfileViewersResponse>('/profiles/me/viewers');
}
