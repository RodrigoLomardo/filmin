import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { WatchItem } from '../watch-items/entities/watch-item.entity';
import { BASE_PERSONA_PROMPT } from './theo-persona';
import type { DebateItem, TheoDebateResponse } from './dto/theo-debate.dto';

const DEBATE_ADDENDUM = `
## Modo Debate ativo

O usuário quer que você debate dois filmes/séries para ajudá-lo a escolher. Você é o árbitro.

Regras do debate:
1. Apresente 3 argumentos DIFERENTES para cada opção (por que vale assistir aquele específico AGORA).
2. Seja honesto: se um for claramente melhor, diga. Se for empate técnico, diga isso também.
3. No veredicto, escolha um — ou declare empate com justificativa.
4. Use seu humor natural, mas seja genuinamente útil na decisão.
5. Os argumentos devem ser CONCRETOS e DIFERENTES entre si — evite generalidades.
6. Cada argumento deve ter no máximo 2 linhas.

Formato de resposta (JSON válido, sem wrapper de markdown):
{
  "argumentsForA": ["argumento 1", "argumento 2", "argumento 3"],
  "argumentsForB": ["argumento 1", "argumento 2", "argumento 3"],
  "verdict": "Texto do veredicto final do Theo (2-4 frases, pode conter markdown)",
  "winner": "A" | "B" | "tie"
}`;

function buildDebatePrompt(itemA: DebateItem, itemB: DebateItem): string {
  const formatItem = (label: string, item: DebateItem): string => {
    const genres = item.generos.length ? item.generos.join(', ') : 'sem gênero';
    const nota = item.notaGeral != null ? `nota geral: ${item.notaGeral}` : 'sem nota ainda';
    return `**${label}: ${item.titulo}** (${item.anoLancamento ?? 'ano desconhecido'}) | Gêneros: ${genres} | ${nota}`;
  };

  return `Debate entre:\n${formatItem('A', itemA)}\n${formatItem('B', itemB)}\n\nGere o debate agora.`;
}

@Injectable()
export class TheoDebateService {
  private readonly groq: Groq;
  private readonly logger = new Logger(TheoDebateService.name);

  constructor(
    @InjectRepository(WatchItem)
    private readonly watchItemRepo: Repository<WatchItem>,
    private readonly configService: ConfigService,
  ) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });
  }

  async debate(
    itemAId: string,
    itemBId: string,
    groupId: string,
  ): Promise<TheoDebateResponse> {
    const [rawA, rawB] = await Promise.all([
      this.watchItemRepo.findOne({
        where: { id: itemAId, groupId },
        relations: ['generos'],
      }),
      this.watchItemRepo.findOne({
        where: { id: itemBId, groupId },
        relations: ['generos'],
      }),
    ]);

    if (!rawA) throw new NotFoundException(`Item A não encontrado.`);
    if (!rawB) throw new NotFoundException(`Item B não encontrado.`);

    const itemA = this.toDebateItem(rawA);
    const itemB = this.toDebateItem(rawB);

    const systemPrompt = `${BASE_PERSONA_PROMPT}\n${DEBATE_ADDENDUM}`;
    const userMessage = buildDebatePrompt(itemA, itemB);

    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.9,
        top_p: 0.95,
        max_tokens: 700,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      });

      const raw = completion.choices[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(raw) as Partial<{
        argumentsForA: string[];
        argumentsForB: string[];
        verdict: string;
        winner: 'A' | 'B' | 'tie';
      }>;

      return {
        itemA,
        itemB,
        argumentsForA: Array.isArray(parsed.argumentsForA) ? parsed.argumentsForA.slice(0, 3) : [],
        argumentsForB: Array.isArray(parsed.argumentsForB) ? parsed.argumentsForB.slice(0, 3) : [],
        verdict: parsed.verdict ?? 'O Theo não conseguiu decidir. Tente de novo.',
        winner: parsed.winner ?? 'tie',
      };
    } catch (err) {
      this.logger.error('Groq debate error', err);
      return {
        itemA,
        itemB,
        argumentsForA: [],
        argumentsForB: [],
        verdict: 'Estou com dificuldades agora. Tente novamente em instantes.',
        winner: 'tie',
      };
    }
  }

  private toDebateItem(item: WatchItem): DebateItem {
    return {
      id: item.id,
      titulo: item.titulo,
      posterUrl: item.posterUrl ?? null,
      anoLancamento: item.anoLancamento ?? null,
      generos: item.generos?.map((g) => g.nome) ?? [],
      notaGeral: item.notaGeral != null ? Number(item.notaGeral) : null,
    };
  }
}
