import { apiFetch } from './client';

export type GeneroUsuario =
  | 'masculino'
  | 'feminino'
  | 'outro'
  | 'prefiro_nao_dizer';

export type Profile = {
  id: string;
  supabaseUserId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  genero: GeneroUsuario | null;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
  genero?: GeneroUsuario;
  isPrivate?: boolean;
};

export type ProfileStats = {
  filmes: number;
  series: number;
  livros: number;
};

export const GENERO_LABELS: Record<GeneroUsuario, string> = {
  masculino: 'Masculino',
  feminino: 'Feminino',
  outro: 'Outro',
  prefiro_nao_dizer: 'Prefiro não dizer',
};

export async function getProfile(): Promise<Profile> {
  return apiFetch<Profile>('/profiles/me');
}

export async function updateProfile(data: UpdateProfileInput): Promise<Profile> {
  return apiFetch<Profile>('/profiles/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getProfileStats(): Promise<ProfileStats> {
  return apiFetch<ProfileStats>('/profiles/stats');
}
