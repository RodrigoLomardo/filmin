import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchItem } from '../watch-items/entities/watch-item.entity';
import { GroupMember } from '../groups/entities/group-member.entity';
import { WatchItemStatus } from '../../common/enums/watch-item-status.enum';
import { WatchItemTipo } from '../../common/enums/watch-item-tipo.enum';
import { GroupTipo } from '../../common/enums/group-tipo.enum';
import { Achievement } from './entities/achievement.entity';
import { ACHIEVEMENT_DEFS, type AchievementDef } from './achievement-defs';

export interface AchievementWithStatus extends AchievementDef {
  unlocked: boolean;
  unlockedAt: Date | null;
  progress?: { current: number; target: number };
}

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  value: number;
  highestLevel: number | null;
  profileIds: string[];
}

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(Achievement)
    private readonly achievementRepo: Repository<Achievement>,

    @InjectRepository(WatchItem)
    private readonly watchItemRepo: Repository<WatchItem>,

    @InjectRepository(GroupMember)
    private readonly groupMemberRepo: Repository<GroupMember>,
  ) {}

  /** Retorna todas as conquistas com status de desbloqueio e progresso */
  async getAll(groupId: string, groupTipo: GroupTipo | null): Promise<AchievementWithStatus[]> {
    const unlocked = await this.achievementRepo.find({ where: { groupId } });
    const unlockedMap = new Map(unlocked.map((a) => [a.slug, a.unlockedAt]));

    return ACHIEVEMENT_DEFS.map((def) => {
      if (def.escopo === 'duo_only' && groupTipo !== GroupTipo.DUO) {
        return { ...def, unlocked: false, unlockedAt: null };
      }

      const isUnlocked = unlockedMap.has(def.slug);
      return {
        ...def,
        unlocked: isUnlocked,
        unlockedAt: isUnlocked ? unlockedMap.get(def.slug)! : null,
      };
    });
  }

  /**
   * Calcula quais conquistas deveriam estar desbloqueadas agora,
   * persiste as novas, e retorna somente as recém-desbloqueadas (delta).
   */
  async check(groupId: string, groupTipo: GroupTipo | null): Promise<AchievementWithStatus[]> {
    const existing = await this.achievementRepo.find({ where: { groupId } });
    const existingSlugs = new Set(existing.map((a) => a.slug));

    const eligible = ACHIEVEMENT_DEFS.filter(
      (def) => def.escopo !== 'duo_only' || groupTipo === GroupTipo.DUO,
    );

    const checks = await Promise.all(
      eligible.map((def) => this.evaluate(def.slug, groupId, groupTipo)),
    );

    const newlyUnlocked: AchievementWithStatus[] = [];

    for (let i = 0; i < eligible.length; i++) {
      const def = eligible[i];
      const shouldUnlock = checks[i];

      if (shouldUnlock && !existingSlugs.has(def.slug)) {
        const saved = await this.achievementRepo.save(
          this.achievementRepo.create({ groupId, slug: def.slug }),
        );
        newlyUnlocked.push({
          ...def,
          unlocked: true,
          unlockedAt: saved.unlockedAt,
        });
      }
    }

    return newlyUnlocked;
  }

  /** Retorna conquistas desbloqueadas de um perfil (resolve groupId internamente) */
  async getUnlockedForGroupByProfileId(profileId: string): Promise<AchievementWithStatus[]> {
    const memberships = await this.groupMemberRepo.find({
      where: { profileId },
      relations: { group: true },
    });

    const primaryMembership =
      memberships.find((m) => m.group.tipo === GroupTipo.DUO) ??
      memberships.find((m) => m.group.tipo === GroupTipo.SOLO);

    if (!primaryMembership) return [];
    return this.getUnlockedForGroup(primaryMembership.groupId);
  }

  /** Retorna conquistas desbloqueadas de um grupo (para perfil público) */
  async getUnlockedForGroup(groupId: string): Promise<AchievementWithStatus[]> {
    const unlocked = await this.achievementRepo.find({ where: { groupId } });
    const unlockedSlugs = new Set(unlocked.map((a) => a.slug));
    const unlockedMap = new Map(unlocked.map((a) => [a.slug, a.unlockedAt]));

    return ACHIEVEMENT_DEFS.filter((def) => unlockedSlugs.has(def.slug)).map((def) => ({
      ...def,
      unlocked: true,
      unlockedAt: unlockedMap.get(def.slug)!,
    }));
  }

  /** Top 10 grupos por categoria de conquista */
  async getLeaderboard(levelGroup: string): Promise<LeaderboardEntry[]> {
    let qb = this.watchItemRepo
      .createQueryBuilder('wi')
      .select('wi.group_id', 'groupId')
      .addSelect('CAST(COUNT(*) AS INTEGER)', 'value');

    switch (levelGroup) {
      case 'cinefilo':
        qb = qb
          .where('wi.status = :status', { status: WatchItemStatus.ASSISTIDO })
          .andWhere('wi.tipo = :tipo', { tipo: WatchItemTipo.FILME });
        break;
      case 'maratonista':
        qb = qb
          .where('wi.status = :status', { status: WatchItemStatus.ASSISTIDO })
          .andWhere('wi.tipo = :tipo', { tipo: WatchItemTipo.SERIE });
        break;
      case 'leitor_avido':
        qb = qb
          .where('wi.status = :status', { status: WatchItemStatus.ASSISTIDO })
          .andWhere('wi.tipo = :tipo', { tipo: WatchItemTipo.LIVRO });
        break;
      case 'colecionador':
        qb = qb.where('wi.status = :status', { status: WatchItemStatus.ASSISTIDO });
        break;
      case 'alma_gemea':
        qb = qb
          .where('wi.nota_dele IS NOT NULL')
          .andWhere('wi.nota_dela IS NOT NULL')
          .andWhere('wi.nota_dele = wi.nota_dela');
        break;
      default:
        return [];
    }

    const rows: { groupId: string; value: number }[] = await qb
      .groupBy('wi.group_id')
      .orderBy('value', 'DESC')
      .limit(10)
      .getRawMany();

    if (!rows.length) return [];

    const groupIds = rows.map((r) => r.groupId);

    const levelGroupSlugs = ACHIEVEMENT_DEFS.filter(
      (d) => d.levelGroup === levelGroup || d.slug === levelGroup,
    ).map((d) => d.slug);

    const [achievements, members] = await Promise.all([
      levelGroupSlugs.length
        ? this.achievementRepo
            .createQueryBuilder('a')
            .where('a.groupId IN (:...groupIds)', { groupIds })
            .andWhere('a.slug IN (:...slugs)', { slugs: levelGroupSlugs })
            .getMany()
        : Promise.resolve([]),
      this.groupMemberRepo
        .createQueryBuilder('gm')
        .leftJoinAndSelect('gm.profile', 'p')
        .where('gm.groupId IN (:...groupIds)', { groupIds })
        .getMany(),
    ]);

    const achievementMap = new Map<string, number>();
    for (const a of achievements) {
      const def = ACHIEVEMENT_DEFS.find((d) => d.slug === a.slug);
      if (def) {
        const current = achievementMap.get(a.groupId) ?? 0;
        achievementMap.set(a.groupId, Math.max(current, def.level ?? 1));
      }
    }

    const namesMap = new Map<string, string[]>();
    const profileIdsMap = new Map<string, string[]>();
    for (const m of members) {
      if (!namesMap.has(m.groupId)) namesMap.set(m.groupId, []);
      if (!profileIdsMap.has(m.groupId)) profileIdsMap.set(m.groupId, []);
      namesMap.get(m.groupId)!.push(m.profile?.firstName ?? 'Usuário');
      profileIdsMap.get(m.groupId)!.push(m.profileId);
    }

    return rows.map((row, idx) => ({
      rank: idx + 1,
      displayName: (namesMap.get(row.groupId) ?? ['Usuário']).join(' & '),
      value: Number(row.value),
      highestLevel: achievementMap.get(row.groupId) ?? null,
      profileIds: profileIdsMap.get(row.groupId) ?? [],
    }));
  }

  // ── Avaliadores individuais ───────────────────────────────────────────────

  private async evaluate(slug: string, groupId: string, groupTipo: GroupTipo | null): Promise<boolean> {
    switch (slug) {
      case 'cinefilo_nivel_1': return (await this.countByTipo(groupId, WatchItemTipo.FILME)) >= 10;
      case 'cinefilo_nivel_2': return (await this.countByTipo(groupId, WatchItemTipo.FILME)) >= 30;
      case 'cinefilo_nivel_3': return (await this.countByTipo(groupId, WatchItemTipo.FILME)) >= 50;

      case 'maratonista_nivel_1': return (await this.countByTipo(groupId, WatchItemTipo.SERIE)) >= 5;
      case 'maratonista_nivel_2': return (await this.countByTipo(groupId, WatchItemTipo.SERIE)) >= 10;
      case 'maratonista_nivel_3': return (await this.countByTipo(groupId, WatchItemTipo.SERIE)) >= 20;

      case 'leitor_avido_nivel_1': return (await this.countByTipo(groupId, WatchItemTipo.LIVRO)) >= 10;
      case 'leitor_avido_nivel_2': return (await this.countByTipo(groupId, WatchItemTipo.LIVRO)) >= 20;
      case 'leitor_avido_nivel_3': return (await this.countByTipo(groupId, WatchItemTipo.LIVRO)) >= 50;

      case 'colecionador_nivel_1': return (await this.countTotal(groupId)) >= 50;
      case 'colecionador_nivel_2': return (await this.countTotal(groupId)) >= 100;
      case 'colecionador_nivel_3': return (await this.countTotal(groupId)) >= 200;

      case 'alma_gemea': return this.checkAlmaGemea(groupId, groupTipo);

      default: return false;
    }
  }

  private async countByTipo(groupId: string, tipo: WatchItemTipo): Promise<number> {
    return this.watchItemRepo.count({
      where: { groupId, tipo, status: WatchItemStatus.ASSISTIDO },
    });
  }

  private async countTotal(groupId: string): Promise<number> {
    return this.watchItemRepo.count({
      where: { groupId, status: WatchItemStatus.ASSISTIDO },
    });
  }

  private async checkAlmaGemea(groupId: string, groupTipo: GroupTipo | null): Promise<boolean> {
    if (groupTipo !== GroupTipo.DUO) return false;

    const cnt = await this.watchItemRepo
      .createQueryBuilder('wi')
      .where('wi.groupId = :groupId', { groupId })
      .andWhere('wi.notaDele IS NOT NULL')
      .andWhere('wi.notaDela IS NOT NULL')
      .andWhere('wi.notaDele = wi.notaDela')
      .getCount();

    return cnt >= 10;
  }

  /** Progresso parcial para exibir nos badges não desbloqueados */
  async getProgress(groupId: string, groupTipo: GroupTipo | null): Promise<Map<string, { current: number; target: number }>> {
    const progress = new Map<string, { current: number; target: number }>();

    const [filmes, series, livros, total] = await Promise.all([
      this.countByTipo(groupId, WatchItemTipo.FILME),
      this.countByTipo(groupId, WatchItemTipo.SERIE),
      this.countByTipo(groupId, WatchItemTipo.LIVRO),
      this.countTotal(groupId),
    ]);

    progress.set('cinefilo_nivel_1', { current: filmes, target: 10 });
    progress.set('cinefilo_nivel_2', { current: filmes, target: 30 });
    progress.set('cinefilo_nivel_3', { current: filmes, target: 50 });

    progress.set('maratonista_nivel_1', { current: series, target: 5 });
    progress.set('maratonista_nivel_2', { current: series, target: 10 });
    progress.set('maratonista_nivel_3', { current: series, target: 20 });

    progress.set('leitor_avido_nivel_1', { current: livros, target: 10 });
    progress.set('leitor_avido_nivel_2', { current: livros, target: 20 });
    progress.set('leitor_avido_nivel_3', { current: livros, target: 50 });

    progress.set('colecionador_nivel_1', { current: total, target: 50 });
    progress.set('colecionador_nivel_2', { current: total, target: 100 });
    progress.set('colecionador_nivel_3', { current: total, target: 200 });

    if (groupTipo === GroupTipo.DUO) {
      const ratedByBoth = await this.watchItemRepo
        .createQueryBuilder('wi')
        .where('wi.groupId = :groupId', { groupId })
        .andWhere('wi.notaDele IS NOT NULL')
        .andWhere('wi.notaDela IS NOT NULL')
        .andWhere('wi.notaDele = wi.notaDela')
        .getCount();

      progress.set('alma_gemea', { current: ratedByBoth, target: 10 });
    }

    return progress;
  }
}
