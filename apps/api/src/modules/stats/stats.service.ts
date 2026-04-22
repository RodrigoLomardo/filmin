import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchItem } from '../watch-items/entities/watch-item.entity';
import { Streak } from '../streak/streak.entity';
import { WatchItemStatus } from '../../common/enums/watch-item-status.enum';
import { WatchItemTipo } from '../../common/enums/watch-item-tipo.enum';
import { GroupTipo } from '../../common/enums/group-tipo.enum';
import { RetroPeriod } from './dto/retrospective-query.dto';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(WatchItem)
    private readonly watchItemRepo: Repository<WatchItem>,
    @InjectRepository(Streak)
    private readonly streakRepo: Repository<Streak>,
  ) {}

  async getRetrospective(groupId: string, period: RetroPeriod, groupTipo: GroupTipo | null) {
    const startDate = this.getStartDate(period);

    const qb = this.watchItemRepo
      .createQueryBuilder('wi')
      .leftJoinAndSelect('wi.generos', 'genero')
      .where('wi.groupId = :groupId', { groupId })
      .andWhere('wi.status = :status', { status: WatchItemStatus.ASSISTIDO });

    if (startDate) {
      // Itens sem dataAssistida usam updatedAt como proxy (quando foram marcados como assistido)
      qb.andWhere(
        '(wi.dataAssistida >= :startDate OR (wi.dataAssistida IS NULL AND wi.updatedAt >= :startDate))',
        { startDate: startDate.toISOString().slice(0, 10) },
      );
    }

    const items = await qb.getMany();

    const totalItems = items.length;

    const byTipo = { filme: 0, serie: 0, livro: 0 };
    for (const item of items) {
      if (item.tipo === WatchItemTipo.FILME) byTipo.filme++;
      else if (item.tipo === WatchItemTipo.SERIE) byTipo.serie++;
      else if (item.tipo === WatchItemTipo.LIVRO) byTipo.livro++;
    }

    const genreCount: Record<string, number> = {};
    for (const item of items) {
      for (const genero of item.generos ?? []) {
        genreCount[genero.nome] = (genreCount[genero.nome] ?? 0) + 1;
      }
    }
    const distribution = Object.entries(genreCount)
      .map(([nome, count]) => ({ nome, count }))
      .sort((a, b) => b.count - a.count);
    const genres = {
      top: distribution[0]?.nome ?? null,
      distribution: distribution.slice(0, 5),
    };

    const isDuo = groupTipo === GroupTipo.DUO;
    let ratings: {
      average?: number | null;
      userA?: number | null;
      userB?: number | null;
    };

    if (isDuo) {
      const deleItems = items.filter((i) => i.notaDele != null);
      const delaItems = items.filter((i) => i.notaDela != null);
      const avgDele = deleItems.length
        ? deleItems.reduce((s, i) => s + Number(i.notaDele), 0) / deleItems.length
        : null;
      const avgDela = delaItems.length
        ? delaItems.reduce((s, i) => s + Number(i.notaDela), 0) / delaItems.length
        : null;
      ratings = {
        userA: avgDele != null ? Math.round(avgDele * 10) / 10 : null,
        userB: avgDela != null ? Math.round(avgDela * 10) / 10 : null,
      };
    } else {
      const geralItems = items.filter((i) => i.notaGeral != null);
      const avg = geralItems.length
        ? geralItems.reduce((s, i) => s + Number(i.notaGeral), 0) / geralItems.length
        : null;
      ratings = { average: avg != null ? Math.round(avg * 10) / 10 : null };
    }

    const ratedItems = items.filter((i) => i.notaGeral != null);
    const sorted = [...ratedItems].sort((a, b) => Number(b.notaGeral) - Number(a.notaGeral));
    const mapHighlight = (item: WatchItem) => ({
      id: item.id,
      titulo: item.titulo,
      posterUrl: item.posterUrl ?? null,
      nota: Number(item.notaGeral),
      tipo: item.tipo,
    });
    const highlights = {
      best: sorted.length > 0 ? mapHighlight(sorted[0]) : null,
      worst: sorted.length > 1 ? mapHighlight(sorted[sorted.length - 1]) : null,
    };

    const screenTime = items.reduce((total, item) => {
      if (item.tipo === WatchItemTipo.FILME) return total + 2;
      if (item.tipo === WatchItemTipo.SERIE) return total + 10;
      return total;
    }, 0);

    const streakRecord = await this.streakRepo.findOne({ where: { groupId } });
    const streak = streakRecord?.maiorSequencia ?? 0;
    const streakTipo = streakRecord?.tipo ?? 'daily';

    return { totalItems, byTipo, genres, ratings, highlights, screenTime, streak, streakTipo };
  }

  private getStartDate(period: RetroPeriod): Date | null {
    if (period === RetroPeriod.ALL) return null;
    const now = new Date();
    if (period === RetroPeriod.MONTH) {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    if (period === RetroPeriod.QUARTER) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      return d;
    }
    if (period === RetroPeriod.YEAR) {
      return new Date(now.getFullYear(), 0, 1);
    }
    return null;
  }

}
