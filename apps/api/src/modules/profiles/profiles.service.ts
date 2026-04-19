import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileStatsDto } from './dto/profile-stats.dto';
import { GroupMember } from '../groups/entities/group-member.entity';
import { WatchItem } from '../watch-items/entities/watch-item.entity';
import { WatchItemStatus } from '../../common/enums/watch-item-status.enum';
import { WatchItemTipo } from '../../common/enums/watch-item-tipo.enum';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profilesRepo: Repository<Profile>,

    @InjectRepository(GroupMember)
    private readonly groupMembersRepo: Repository<GroupMember>,

    @InjectRepository(WatchItem)
    private readonly watchItemRepo: Repository<WatchItem>,
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
}
