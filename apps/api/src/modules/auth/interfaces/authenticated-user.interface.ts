import type { GroupTipo } from '../../../common/enums/group-tipo.enum';

/**
 * Objeto anexado em `request.user` após autenticação bem-sucedida.
 * groupId / groupTipo são null quando o usuário ainda não pertence a nenhum grupo.
 */
export interface AuthenticatedUser {
  supabaseUserId: string;
  email: string;
  profileId: string;
  groupId: string | null;
  groupTipo: GroupTipo | null;
}
