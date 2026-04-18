import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../profiles/entities/profile.entity';
import { Group } from '../groups/entities/group.entity';
import { GroupMember } from '../groups/entities/group-member.entity';
import { GeneroUsuario } from '../../common/enums/genero-usuario.enum';
import { GroupTipo } from '../../common/enums/group-tipo.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Profile)
    private readonly profilesRepo: Repository<Profile>,

    @InjectRepository(GroupMember)
    private readonly groupMembersRepo: Repository<GroupMember>,

    @InjectRepository(Group)
    private readonly groupsRepo: Repository<Group>,
  ) {}

  /**
   * Busca o profile pelo supabaseUserId.
   * Se não existir, cria automaticamente (first login).
   * Retorna o profile e os grupos do usuário.
   */
  async findOrCreateProfile(
    supabaseUserId: string,
    email: string,
    userMetadata?: { firstName?: string; lastName?: string; genero?: string },
  ): Promise<{
    profile: Profile;
    groupId: string | null;
    groupTipo: GroupTipo | null;
    soloGroupId: string | null;
  }> {
    let profile = await this.profilesRepo.findOne({ where: { supabaseUserId } });

    if (!profile) {
      const validGeneros = Object.values(GeneroUsuario) as string[];
      profile = this.profilesRepo.create({
        supabaseUserId,
        email,
        firstName: userMetadata?.firstName ?? null,
        lastName: userMetadata?.lastName ?? null,
        genero:
          userMetadata?.genero && validGeneros.includes(userMetadata.genero)
            ? (userMetadata.genero as GeneroUsuario)
            : null,
      });
      await this.profilesRepo.save(profile);
    }

    const { groupId, groupTipo, soloGroupId } = await this.getProfileGroups(profile.id);
    return { profile, groupId, groupTipo, soloGroupId };
  }

  /**
   * Retorna os grupos do usuário: primário (duo tem prioridade) e solo.
   * Se o usuário está em um duo mas ainda não tem grupo solo, cria automaticamente.
   * Garante que todo usuário duo sempre possua uma galeria solo.
   */
  async getProfileGroups(profileId: string): Promise<{
    groupId: string | null;
    groupTipo: GroupTipo | null;
    soloGroupId: string | null;
  }> {
    const members = await this.groupMembersRepo.find({
      where: { profileId },
      relations: { group: true },
    });

    if (!members.length) return { groupId: null, groupTipo: null, soloGroupId: null };

    const soloMember = members.find((m) => m.group.tipo === GroupTipo.SOLO);
    const duoMember = members.find((m) => m.group.tipo === GroupTipo.DUO);
    const primary = duoMember ?? soloMember;

    // Auto-provisiona grupo solo para usuários duo que ainda não possuem um
    let soloGroupId = soloMember?.groupId ?? null;
    if (duoMember && !soloMember) {
      const soloGroup = this.groupsRepo.create({ tipo: GroupTipo.SOLO });
      const savedSolo = await this.groupsRepo.save(soloGroup);
      await this.groupMembersRepo.save(
        this.groupMembersRepo.create({ groupId: savedSolo.id, profileId }),
      );
      soloGroupId = savedSolo.id;
    }

    return {
      groupId: primary?.groupId ?? null,
      groupTipo: primary?.group.tipo ?? null,
      soloGroupId,
    };
  }

  /**
   * Retorna o profile com dados dos grupos para o endpoint /auth/me.
   */
  async getMe(profileId: string): Promise<{
    profile: Profile;
    groupId: string | null;
    groupTipo: GroupTipo | null;
    soloGroupId: string | null;
  }> {
    const profile = await this.profilesRepo.findOneOrFail({ where: { id: profileId } });
    const { groupId, groupTipo, soloGroupId } = await this.getProfileGroups(profileId);
    return { profile, groupId, groupTipo, soloGroupId };
  }
}
