import { apiFetch } from './client';

export type GroupTipo = 'solo' | 'duo';

export type GroupMember = {
  id: string;
  profileId: string;
  joinedAt: string;
};

export type Group = {
  id: string;
  tipo: GroupTipo;
  inviteCode: string | null;
  members: GroupMember[];
};

export async function getMyGroup(): Promise<Group | null> {
  return apiFetch<Group | null>('/groups/me');
}

export async function createSoloGroup(): Promise<Group> {
  return apiFetch<Group>('/groups/solo', { method: 'POST' });
}

export async function createDuoGroup(): Promise<Group> {
  return apiFetch<Group>('/groups/duo', { method: 'POST' });
}

export async function joinGroupByInviteCode(inviteCode: string): Promise<Group> {
  return apiFetch<Group>(`/groups/join/${inviteCode}`, { method: 'POST' });
}
