import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../profiles/entities/profile.entity';
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
      try {
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
      } catch (err: any) {
        // Unique constraint violation: outra requisição concurrent criou o profile primeiro
        if (err?.code === '23505') {
          const existing = await this.profilesRepo.findOne({ where: { supabaseUserId } });
          if (!existing) throw err;
          profile = existing;
        } else {
          throw err;
        }
      }
    }

    const { groupId, groupTipo, soloGroupId } = await this.getProfileGroups(profile.id);
    return { profile, groupId, groupTipo, soloGroupId };
  }

  /**
   * Retorna os grupos do usuário: primário (duo tem prioridade) e solo.
   * Não cria grupos aqui — criação acontece apenas nos fluxos explícitos
   * (createDuo, joinByInviteCode, leaveDuo) para evitar race conditions.
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

    return {
      groupId: primary?.groupId ?? null,
      groupTipo: primary?.group.tipo ?? null,
      soloGroupId: soloMember?.groupId ?? null,
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
