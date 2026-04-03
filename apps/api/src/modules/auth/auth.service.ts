import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../profiles/entities/profile.entity';
import { GroupMember } from '../groups/entities/group-member.entity';
import { GeneroUsuario } from '../../common/enums/genero-usuario.enum';

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
   * Retorna o profile e o groupId atual do usuário (null se sem grupo).
   */
  async findOrCreateProfile(
    supabaseUserId: string,
    email: string,
    userMetadata?: { firstName?: string; lastName?: string; genero?: string },
  ): Promise<{ profile: Profile; groupId: string | null }> {
    let profile = await this.profilesRepo.findOne({
      where: { supabaseUserId },
    });

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

    const groupId = await this.getProfileGroupId(profile.id);

    return { profile, groupId };
  }

  /**
   * Retorna o groupId do profile, ou null se ainda sem grupo.
   */
  async getProfileGroupId(profileId: string): Promise<string | null> {
    const member = await this.groupMembersRepo.findOne({
      where: { profileId },
      select: ['groupId'],
    });
    return member?.groupId ?? null;
  }

  /**
   * Retorna o profile com dados do grupo para o endpoint /auth/me.
   */
  async getMe(
    profileId: string,
  ): Promise<{ profile: Profile; groupId: string | null }> {
    const profile = await this.profilesRepo.findOneOrFail({
      where: { id: profileId },
    });
    const groupId = await this.getProfileGroupId(profileId);
    return { profile, groupId };
  }
}
