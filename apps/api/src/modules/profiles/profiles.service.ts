import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { ProfileViewer } from './entities/profile-viewer.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileStatsDto } from './dto/profile-stats.dto';
import { PublicProfileDto } from './dto/public-profile.dto';
import { SearchProfileResultDto } from './dto/search-profile.dto';
import { ProfileViewersResponseDto } from './dto/profile-viewers.dto';
import { GroupMember } from '../groups/entities/group-member.entity';
import { WatchItem } from '../watch-items/entities/watch-item.entity';
import { Streak } from '../streak/streak.entity';
import { WatchItemStatus } from '../../common/enums/watch-item-status.enum';
import { WatchItemTipo } from '../../common/enums/watch-item-tipo.enum';
import { GroupTipo } from '../../common/enums/group-tipo.enum';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profilesRepo: Repository<Profile>,

    @InjectRepository(ProfileViewer)
    private readonly profileViewersRepo: Repository<ProfileViewer>,

    @InjectRepository(GroupMember)
    private readonly groupMembersRepo: Repository<GroupMember>,

    @InjectRepository(WatchItem)
    private readonly watchItemRepo: Repository<WatchItem>,

    @InjectRepository(Streak)
    private readonly streakRepo: Repository<Streak>,
  ) {}

  async findById(profileId: string): Promise<Profile> {
    return this.profilesRepo.findOneOrFail({ where: { id: profileId } });
  }

  async update(profileId: string, dto: UpdateProfileDto): Promise<Profile> {
    await this.profilesRepo.update(profileId, dto);
    return this.findById(profileId);
  }

  async getStats(profileId: string): Promise<ProfileStatsDto> {
    const memberships = await this.groupMembersRepo.find({
      where: { profileId },
      select: ['groupId'],
    });

    if (!memberships.length) {
      return { filmes: 0, series: 0, livros: 0 };
    }

    const groupIds = memberships.map((m) => m.groupId);

    const rows = await this.watchItemRepo
      .createQueryBuilder('wi')
      .select('wi.tipo', 'tipo')
      .addSelect('COUNT(wi.id)', 'total')
      .where('wi.groupId IN (:...groupIds)', { groupIds })
      .andWhere('wi.status = :status', { status: WatchItemStatus.ASSISTIDO })
      .groupBy('wi.tipo')
      .getRawMany<{ tipo: WatchItemTipo; total: string }>();

    const count = (tipo: WatchItemTipo) =>
      parseInt(rows.find((r) => r.tipo === tipo)?.total ?? '0', 10);

    return {
      filmes: count(WatchItemTipo.FILME),
      series: count(WatchItemTipo.SERIE),
      livros: count(WatchItemTipo.LIVRO),
    };
  }

  async searchProfiles(
    q: string,
    requestingProfileId: string,
  ): Promise<SearchProfileResultDto[]> {
    if (q.trim().length < 2) return [];

    const profiles = await this.profilesRepo
      .createQueryBuilder('p')
      .where(
        '(p.firstName ILIKE :q OR p.lastName ILIKE :q OR p.email ILIKE :q)',
        { q: `%${q.trim()}%` },
      )
      .andWhere('p.id != :selfId', { selfId: requestingProfileId })
      .take(20)
      .getMany();

    if (!profiles.length) return [];

    const profileIds = profiles.map((p) => p.id);
    const memberships = await this.groupMembersRepo.find({
      where: { profileId: In(profileIds) },
      relations: { group: true },
    });

    const groupMap = new Map<string, string>();
    for (const m of memberships) {
      const current = groupMap.get(m.profileId);
      if (!current || m.group.tipo === GroupTipo.DUO) {
        groupMap.set(m.profileId, m.group.tipo);
      }
    }

    return profiles.map((p) => ({
      id: p.id,
      firstName: p.firstName ?? null,
      lastName: p.lastName ?? null,
      email: p.email ?? null,
      isPrivate: p.isPrivate,
      groupTipo: groupMap.get(p.id) ?? null,
    }));
  }

  async getPublicProfile(
    profileId: string,
    viewerProfileId: string,
  ): Promise<PublicProfileDto> {
    const profile = await this.profilesRepo.findOne({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Perfil não encontrado');

    if (profile.isPrivate && profileId !== viewerProfileId) {
      throw new ForbiddenException('PROFILE_PRIVATE');
    }

    if (profileId !== viewerProfileId && !profile.isPrivate) {
      await this.recordView(profileId, viewerProfileId);
    }

    const memberships = await this.groupMembersRepo.find({
      where: { profileId },
      relations: { group: { members: { profile: true } } },
    });

    let groupTipo: string | null = null;
    let duoPartner: PublicProfileDto['duoPartner'] = null;
    let primaryGroupId: string | null = null;

    const duoMembership = memberships.find((m) => m.group.tipo === GroupTipo.DUO);
    const soloMembership = memberships.find((m) => m.group.tipo === GroupTipo.SOLO);
    const primaryMembership = duoMembership ?? soloMembership;

    if (primaryMembership) {
      groupTipo = primaryMembership.group.tipo;
      primaryGroupId = primaryMembership.groupId;

      if (primaryMembership.group.tipo === GroupTipo.DUO) {
        const partnerMember = primaryMembership.group.members.find(
          (m) => m.profileId !== profileId,
        );
        if (partnerMember?.profile) {
          duoPartner = {
            id: partnerMember.profile.id,
            firstName: partnerMember.profile.firstName ?? null,
            lastName: partnerMember.profile.lastName ?? null,
          };
        }
      }
    }

    let streakSequencia = 0;
    if (primaryGroupId) {
      const streak = await this.streakRepo.findOne({
        where: { groupId: primaryGroupId },
      });
      streakSequencia = streak?.sequenciaAtual ?? 0;
    }

    const stats = await this.getStats(profileId);

    const viewersCount = await this.profileViewersRepo.count({
      where: { viewedProfileId: profileId },
    });

    let recentWatched: PublicProfileDto['recentWatched'] = [];
    if (primaryGroupId) {
      const items = await this.watchItemRepo.find({
        where: { groupId: primaryGroupId, status: WatchItemStatus.ASSISTIDO },
        order: { lastRatingAt: 'DESC', createdAt: 'DESC' },
        take: 12,
        select: ['id', 'titulo', 'tipo', 'posterUrl', 'notaGeral', 'anoLancamento'],
      });
      recentWatched = items.map((i) => ({
        id: i.id,
        titulo: i.titulo,
        tipo: i.tipo,
        posterUrl: i.posterUrl ?? null,
        notaGeral: i.notaGeral != null ? Number(i.notaGeral) : null,
        anoLancamento: i.anoLancamento ?? null,
      }));
    }

    return {
      id: profile.id,
      firstName: profile.firstName ?? null,
      lastName: profile.lastName ?? null,
      isPrivate: profile.isPrivate,
      groupTipo,
      duoPartner,
      streakSequencia,
      stats,
      viewersCount,
      recentWatched,
    };
  }

  async getMyViewers(profileId: string): Promise<ProfileViewersResponseDto> {
    const viewers = await this.profileViewersRepo.find({
      where: { viewedProfileId: profileId },
      relations: { viewerProfile: true },
      order: { viewedAt: 'DESC' },
    });

    return {
      count: viewers.length,
      viewers: viewers.map((v) => ({
        id: v.viewerProfile.id,
        firstName: v.viewerProfile.firstName ?? null,
        lastName: v.viewerProfile.lastName ?? null,
        email: v.viewerProfile.email ?? null,
        viewedAt: v.viewedAt,
      })),
    };
  }

  private async recordView(
    viewedProfileId: string,
    viewerProfileId: string,
  ): Promise<void> {
    await this.profileViewersRepo
      .createQueryBuilder()
      .insert()
      .into(ProfileViewer)
      .values({ viewedProfileId, viewerProfileId, viewedAt: new Date() })
      .orUpdate(['viewed_at'], ['viewed_profile_id', 'viewer_profile_id'])
      .execute();
  }
}
