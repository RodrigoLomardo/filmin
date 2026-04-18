import { apiFetch } from './client';

export type GroupTipo = 'solo' | 'duo';

export type ProfileSummary = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
};

export type GroupMember = {
  id: string;
  profileId: string;
  joinedAt: string;
  profile?: ProfileSummary;
};

export type Group = {
  id: string;
  tipo: GroupTipo;
  inviteCode: string | null;
  members: GroupMember[];
  createdAt: string;
  /**
   * ID do grupo solo pessoal do usuário.
   * Para usuários solo-only: igual ao id do grupo.
   * Para usuários duo: aponta para o grupo solo separado.
   * null se o usuário ainda não tem grupo.
   */
  soloGroupId: string | null;
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

export async function leaveDuoGroup(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/groups/leave-duo', { method: 'POST' });
}
