import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchItem } from '../watch-items/entities/watch-item.entity';
import { WatchItemStatus } from '../../common/enums/watch-item-status.enum';
import { GroupTipo } from '../../common/enums/group-tipo.enum';
import { TheoGroqService } from './theo-groq.service';
import { TheoQueryDto } from './dto/theo-query.dto';
import { TheoRecommendationService } from './theo-recommendation.service';
import { parseIntent } from './theo-intent.parser';

export type TheoIntent =
  | 'recommend_movie'
  | 'recommend_duo'
  | 'surprise_me'
  | 'out_of_scope';

export interface TheoResponse {
  intent: TheoIntent;
  message: string;
  suggestions?: string[];
}

@Injectable()
export class TheoService {
  constructor(
    @InjectRepository(WatchItem)
    private readonly watchItemRepo: Repository<WatchItem>,
    private readonly groqService: TheoGroqService,
    private readonly recommendationService: TheoRecommendationService,
  ) {}

  async query(
    dto: TheoQueryDto,
    groupId: string,
    groupTipo: GroupTipo | null,
  ): Promise<TheoResponse> {
    const parsedIntent = parseIntent(dto.message);
    const isDuo = groupTipo === GroupTipo.DUO || parsedIntent.isDuoRequest;

    const [watched, recommendationCtx] = await Promise.all([
      this.fetchWatchedSummary(groupId),
      this.recommendationService.buildContext(groupId, isDuo, parsedIntent),
    ]);

    return this.groqService.ask(dto.message, {
      watched,
      groupTipo,
      parsedIntent,
      recommendationCtx,
    });
  }

  private async fetchWatchedSummary(groupId: string): Promise<string[]> {
    const items = await this.watchItemRepo.find({
      where: { groupId, status: WatchItemStatus.ASSISTIDO },
      order: { lastRatingAt: 'DESC' },
      take: 8,
    });
    return items.map((i) => `- ${i.titulo} (${i.tipo}, nota: ${i.notaGeral ?? '—'})`);
  }
}
