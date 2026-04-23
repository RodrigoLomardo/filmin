import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchItem } from '../watch-items/entities/watch-item.entity';
import { WatchItemStatus } from '../../common/enums/watch-item-status.enum';
import { GroupTipo } from '../../common/enums/group-tipo.enum';
import { TheoGroqService } from './theo-groq.service';
import { TheoQueryDto } from './dto/theo-query.dto';
import { TheoRecommendationService } from './theo-recommendation.service';
import { TheoMemoryService } from './theo-memory.service';
import { parseIntent } from './theo-intent.parser';
import { extractTitlesFromResponse } from './theo-memory.utils';

export type TheoIntent =
  | 'recommend_movie'
  | 'recommend_duo'
  | 'surprise_me'
  | 'out_of_scope'
  | 'family_chat';

export interface TheoResponse {
  intent: TheoIntent;
  message: string;
  suggestions?: string[];
}

function resolveSessionId(dto: TheoQueryDto): string {
  return dto.sessionId?.trim() || `fallback-${Date.now()}`;
}

@Injectable()
export class TheoService {
  constructor(
    @InjectRepository(WatchItem)
    private readonly watchItemRepo: Repository<WatchItem>,
    private readonly groqService: TheoGroqService,
    private readonly recommendationService: TheoRecommendationService,
    private readonly memoryService: TheoMemoryService,
  ) {}

  async query(
    dto: TheoQueryDto,
    groupId: string,
    groupTipo: GroupTipo | null,
    userEmail: string,
  ): Promise<TheoResponse> {
    const sessionId = resolveSessionId(dto);
    const parsedIntent = parseIntent(dto.message);
    const isDuo = groupTipo === GroupTipo.DUO || parsedIntent.isDuoRequest;

    const [watched, recommendationCtx, memory] = await Promise.all([
      this.fetchWatchedSummary(groupId),
      this.recommendationService.buildContext(groupId, isDuo, parsedIntent),
      this.memoryService.get(groupId, sessionId),
    ]);

    const response = await this.groqService.ask(dto.message, {
      watched,
      groupTipo,
      parsedIntent,
      recommendationCtx,
      memory,
      userEmail,
      voiceMode: dto.voiceMode,
    });

    if (response.intent !== 'out_of_scope') {
      const newTitles = extractTitlesFromResponse(response);
      await this.memoryService.update(groupId, sessionId, {
        userMessage: dto.message,
        assistantMessage: response.message,
        newTitles,
      });
    }

    return response;
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
