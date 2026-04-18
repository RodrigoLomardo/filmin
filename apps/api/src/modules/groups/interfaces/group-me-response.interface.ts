import type { GroupTipo } from '../../../common/enums/group-tipo.enum';
import type { GroupMember } from '../entities/group-member.entity';

/**
 * Resposta do endpoint GET /groups/me.
 * Inclui o soloGroupId para o frontend saber onde criar/listar itens da galeria solo.
 *
 * Para usuários solo puro: soloGroupId === id (mesmo grupo).
 * Para usuários duo: soloGroupId aponta para o grupo solo separado.
 */
export interface GroupMeResponse {
  id: string;
  tipo: GroupTipo;
  inviteCode?: string | null;
  members: GroupMember[];
  createdAt: Date;
  updatedAt: Date;
  soloGroupId: string | null;
}
