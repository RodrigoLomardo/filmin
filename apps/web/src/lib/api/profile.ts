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
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
  genero?: GeneroUsuario;
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
