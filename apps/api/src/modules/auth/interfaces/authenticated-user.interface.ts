import type { GroupTipo } from '../../../common/enums/group-tipo.enum';
import type { GeneroUsuario } from '../../../common/enums/genero-usuario.enum';

/**
 * Objeto anexado em `request.user` após autenticação bem-sucedida.
 * groupId / groupTipo são null quando o usuário ainda não pertence a nenhum grupo.
 * soloGroupId aponta para o grupo solo pessoal do usuário (sempre existe após onboarding).
 */
export interface AuthenticatedUser {
  supabaseUserId: string;
  email: string;
  profileId: string;
  groupId: string | null;
  groupTipo: GroupTipo | null;
  soloGroupId: string | null;
  genero: GeneroUsuario | null;
}
