/**
 * Objeto anexado em `request.user` após autenticação bem-sucedida.
 * groupId é null quando o usuário ainda não pertence a nenhum grupo (onboarding).
 */
export interface AuthenticatedUser {
  supabaseUserId: string;
  email: string;
  profileId: string;
  groupId: string | null;
}
