import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, MoreThan, Repository } from 'typeorm';
import { Nudge } from './entities/nudge.entity';
import { NudgeType } from '../../common/enums/nudge-type.enum';
import { NudgeAiService } from './nudge-ai.service';
import { WatchItem } from '../watch-items/entities/watch-item.entity';
import { WatchItemStatus } from '../../common/enums/watch-item-status.enum';
import { WatchItemTipo } from '../../common/enums/watch-item-tipo.enum';

const NUDGE_COOLDOWN_HOURS = 20;
const CONTINUITY_THRESHOLD_DAYS = 7;
const INACTIVITY_THRESHOLD_DAYS = 14;

const DIA_SEMANA_PT = [
  'domingo', 'segunda-feira', 'terça-feira',
  'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado',
];

@Injectable()
export class NudgesService {
  private readonly logger = new Logger(NudgesService.name);

  constructor(
    @InjectRepository(Nudge)
    private readonly nudgesRepo: Repository<Nudge>,

    @InjectRepository(WatchItem)
    private readonly watchItemRepo: Repository<WatchItem>,

    private readonly nudgeAiService: NudgeAiService,
  ) {}

  // ─── Leitura ────────────────────────────────────────────────────────────────

  async findUnread(groupId: string): Promise<Nudge[]> {
    return this.nudgesRepo.find({
      where: { groupId, readAt: IsNull() },
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

  async markAsRead(id: string, groupId: string): Promise<void> {
    await this.nudgesRepo.update({ id, groupId }, { readAt: new Date() });
  }

  async markAllRead(groupId: string): Promise<void> {
    await this.nudgesRepo.update(
      { groupId, readAt: IsNull() },
      { readAt: new Date() },
    );
  }

  // ─── Geração on-demand ──────────────────────────────────────────────────────

  /**
   * Chamado quando o usuário abre o app.
   * Avalia condições e cria novos nudges se ainda não foram gerados recentemente.
   */
  async evaluateAndCreate(groupId: string): Promise<void> {
    const now = new Date();
    const cooldownCutoff = new Date(now.getTime() - NUDGE_COOLDOWN_HOURS * 60 * 60 * 1000);

    await Promise.allSettled([
      this.maybeCreateSessionNudge(groupId, now, cooldownCutoff),
      this.maybeCreateContinuityNudge(groupId, now, cooldownCutoff),
      this.maybeCreateInactivityNudge(groupId, now, cooldownCutoff),
    ]);
  }

  // ─── Nudge de Sessão ────────────────────────────────────────────────────────

  private async maybeCreateSessionNudge(
    groupId: string,
    now: Date,
    cooldownCutoff: Date,
  ): Promise<void> {
    const hour = now.getHours();
    const isNightSession = hour >= 19;
    const isSundayAfternoon = now.getDay() === 0 && hour >= 14 && hour < 20;
    const isMondayMorning = now.getDay() === 1 && hour >= 7 && hour < 12;

    if (!isNightSession && !isSundayAfternoon && !isMondayMorning) return;

    const recent = await this.recentNudgeExists(groupId, NudgeType.SESSION, cooldownCutoff);
    if (recent) return;

    const diaSemana = DIA_SEMANA_PT[now.getDay()];
    const horario = `${String(now.getHours()).padStart(2, '0')}h`;

    const message = await this.nudgeAiService.generate({
      type: NudgeType.SESSION,
      diaSemana,
      horario,
    });
    if (!message) return;

    await this.nudgesRepo.save(
      this.nudgesRepo.create({ groupId, type: NudgeType.SESSION, message, data: null }),
    );
  }

  // ─── Nudge de Continuidade ──────────────────────────────────────────────────

  private async maybeCreateContinuityNudge(
    groupId: string,
    now: Date,
    cooldownCutoff: Date,
  ): Promise<void> {
    const recent = await this.recentNudgeExists(groupId, NudgeType.CONTINUITY, cooldownCutoff);
    if (recent) return;

    const thresholdDate = new Date(
      now.getTime() - CONTINUITY_THRESHOLD_DAYS * 24 * 60 * 60 * 1000,
    );

    const stalled = await this.watchItemRepo.findOne({
      where: {
        groupId,
        status: WatchItemStatus.ASSISTINDO,
        tipo: WatchItemTipo.SERIE,
        updatedAt: LessThan(thresholdDate),
      },
      order: { updatedAt: 'DESC' },
    });

    if (!stalled) return;

    const diasParado = Math.floor(
      (now.getTime() - stalled.updatedAt.getTime()) / (24 * 60 * 60 * 1000),
    );

    const message = await this.nudgeAiService.generate({
      type: NudgeType.CONTINUITY,
      titulo: stalled.titulo,
      diasParado,
    });
    if (!message) return;

    await this.nudgesRepo.save(
      this.nudgesRepo.create({
        groupId,
        type: NudgeType.CONTINUITY,
        message,
        data: { watchItemId: stalled.id },
      }),
    );
  }

  // ─── Nudge de Inatividade ───────────────────────────────────────────────────

  private async maybeCreateInactivityNudge(
    groupId: string,
    now: Date,
    cooldownCutoff: Date,
  ): Promise<void> {
    const recent = await this.recentNudgeExists(groupId, NudgeType.INACTIVITY, cooldownCutoff);
    if (recent) return;

    const thresholdDate = new Date(
      now.getTime() - INACTIVITY_THRESHOLD_DAYS * 24 * 60 * 60 * 1000,
    );

    const mostRecent = await this.watchItemRepo.findOne({
      where: { groupId },
      order: { updatedAt: 'DESC' },
    });

    if (!mostRecent) return;
    if (mostRecent.updatedAt >= thresholdDate) return;

    const diasParado = Math.floor(
      (now.getTime() - mostRecent.updatedAt.getTime()) / (24 * 60 * 60 * 1000),
    );

    const message = await this.nudgeAiService.generate({
      type: NudgeType.INACTIVITY,
      diasParado,
    });
    if (!message) return;

    await this.nudgesRepo.save(
      this.nudgesRepo.create({ groupId, type: NudgeType.INACTIVITY, message, data: null }),
    );
  }

  // ─── Util ────────────────────────────────────────────────────────────────────

  private async recentNudgeExists(
    groupId: string,
    type: NudgeType,
    cutoff: Date,
  ): Promise<boolean> {
    const count = await this.nudgesRepo.count({
      where: { groupId, type, createdAt: MoreThan(cutoff) },
    });
    return count > 0;
  }
}
