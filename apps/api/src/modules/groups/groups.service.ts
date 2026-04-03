import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { GroupTipo } from '../../common/enums/group-tipo.enum';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupsRepo: Repository<Group>,

    @InjectRepository(GroupMember)
    private readonly groupMembersRepo: Repository<GroupMember>,
  ) {}

  /**
   * Retorna o grupo do usuário com a lista de membros (e seus profiles).
   * Retorna null se o usuário ainda não pertence a nenhum grupo.
   */
  async getMyGroup(profileId: string): Promise<Group | null> {
    const member = await this.groupMembersRepo.findOne({
      where: { profileId },
      relations: { group: { members: { profile: true } } },
    });
    return member?.group ?? null;
  }

  /**
   * Cria um grupo do tipo solo e adiciona o usuário como único membro.
   * Lança ConflictException se o usuário já pertencer a um grupo.
   */
  async createSolo(profileId: string): Promise<Group> {
    await this.assertNoGroup(profileId);

    const group = this.groupsRepo.create({ tipo: GroupTipo.SOLO });
    const savedGroup = await this.groupsRepo.save(group);

    await this.groupMembersRepo.save(
      this.groupMembersRepo.create({ groupId: savedGroup.id, profileId }),
    );

    return this.getGroupWithMembers(savedGroup.id);
  }

  /**
   * Cria um grupo do tipo duo, gera um invite_code único e adiciona o
   * usuário como primeiro membro.
   * Lança ConflictException se o usuário já pertencer a um grupo.
   */
  async createDuo(profileId: string): Promise<Group> {
    await this.assertNoGroup(profileId);

    const inviteCode = randomBytes(8).toString('base64url');

    const group = this.groupsRepo.create({ tipo: GroupTipo.DUO, inviteCode });
    const savedGroup = await this.groupsRepo.save(group);

    await this.groupMembersRepo.save(
      this.groupMembersRepo.create({ groupId: savedGroup.id, profileId }),
    );

    return this.getGroupWithMembers(savedGroup.id);
  }

  /**
   * Entra em um grupo duo existente via invite_code.
   *
   * Validações (nesta ordem):
   *  1. invite_code existe           → 404
   *  2. grupo é do tipo duo          → 400 (grupos solo não aceitam convites)
   *  3. grupo ainda não está cheio   → 409 (limite de 2 membros)
   *  4. usuário ainda não tem grupo  → 409
   */
  async joinByInviteCode(profileId: string, inviteCode: string): Promise<Group> {
    const group = await this.groupsRepo.findOne({
      where: { inviteCode },
      relations: { members: true },
    });

    if (!group) {
      throw new NotFoundException('Convite inválido ou não encontrado.');
    }

    if (group.tipo !== GroupTipo.DUO) {
      throw new BadRequestException('Este grupo não aceita convites.');
    }

    if (group.members.length >= 2) {
      throw new ConflictException('O grupo já está completo.');
    }

    await this.assertNoGroup(profileId);

    await this.groupMembersRepo.save(
      this.groupMembersRepo.create({ groupId: group.id, profileId }),
    );

    return this.getGroupWithMembers(group.id);
  }

  // ─── helpers ────────────────────────────────────────────────────────────────

  private async assertNoGroup(profileId: string): Promise<void> {
    const existing = await this.groupMembersRepo.findOne({
      where: { profileId },
    });
    if (existing) {
      throw new ConflictException('Você já pertence a um grupo.');
    }
  }

  private async getGroupWithMembers(groupId: string): Promise<Group> {
    return this.groupsRepo.findOne({
      where: { id: groupId },
      relations: { members: { profile: true } },
    }) as Promise<Group>;
  }
}
