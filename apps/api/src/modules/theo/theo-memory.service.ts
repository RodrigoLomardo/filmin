import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TheoMemory, ConversationTurn } from './entities/theo-memory.entity';

const MAX_RECENT_TITLES = 12;
const MAX_HISTORY_TURNS = 5; // 5 pares user+assistant = 10 mensagens

export interface MemorySnapshot {
  recentTitles: string[];
  conversationHistory: ConversationTurn[];
}

export interface MemoryUpdate {
  userMessage: string;
  assistantMessage: string;
  newTitles?: string[];
}

@Injectable()
export class TheoMemoryService {
  constructor(
    @InjectRepository(TheoMemory)
    private readonly memoryRepo: Repository<TheoMemory>,
  ) {}

  async get(groupId: string, sessionId: string): Promise<MemorySnapshot> {
    const record = await this.memoryRepo.findOne({
      where: { groupId, sessionId },
    });

    if (!record) {
      return { recentTitles: [], conversationHistory: [] };
    }

    return {
      recentTitles: record.recentTitles ?? [],
      conversationHistory: record.conversationHistory ?? [],
    };
  }

  async update(groupId: string, sessionId: string, data: MemoryUpdate): Promise<void> {
    const newTurns: ConversationTurn[] = [
      { role: 'user', content: data.userMessage },
      { role: 'assistant', content: data.assistantMessage },
    ];

    const existing = await this.memoryRepo.findOne({ where: { groupId, sessionId } });

    if (existing) {
      const history = this.trimHistory([...existing.conversationHistory, ...newTurns]);
      const titles = this.mergeRecentTitles(existing.recentTitles, data.newTitles ?? []);
      await this.memoryRepo.update(existing.id, {
        conversationHistory: history,
        recentTitles: titles,
      });
    } else {
      const record = this.memoryRepo.create({
        groupId,
        sessionId,
        conversationHistory: this.trimHistory(newTurns),
        recentTitles: (data.newTitles ?? []).slice(0, MAX_RECENT_TITLES),
      });
      await this.memoryRepo.save(record);
    }
  }

  async reset(groupId: string, sessionId: string): Promise<void> {
    await this.memoryRepo.delete({ groupId, sessionId });
  }

  private trimHistory(turns: ConversationTurn[]): ConversationTurn[] {
    // Mantém apenas os últimos MAX_HISTORY_TURNS pares (garantindo pares completos)
    const maxMessages = MAX_HISTORY_TURNS * 2;
    return turns.slice(-maxMessages);
  }

  private mergeRecentTitles(existing: string[], incoming: string[]): string[] {
    const seen = new Set(existing.map((t) => t.toLowerCase()));
    const newUnique = incoming.filter((t) => !seen.has(t.toLowerCase()));
    return [...existing, ...newUnique].slice(-MAX_RECENT_TITLES);
  }
}
