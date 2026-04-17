import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StreakTipo } from '../../common/enums/streak-tipo.enum';
import { Streak } from './streak.entity';
import {
  computeStreakUpdate,
  isValidActivityDay,
} from './streak.utils';

@Injectable()
export class StreakService {
  constructor(
    @InjectRepository(Streak)
    private readonly streakRepository: Repository<Streak>,
  ) {}

  async getOrCreate(groupId: string): Promise<Streak> {
    let streak = await this.streakRepository.findOne({ where: { groupId } });

    if (!streak) {
      streak = this.streakRepository.create({
        groupId,
        tipo: StreakTipo.DAILY,
        sequenciaAtual: 0,
        maiorSequencia: 0,
        ultimoRegistroEm: null,
        periodoAtualValido: false,
      });
      streak = await this.streakRepository.save(streak);
    }

    return streak;
  }

  async registerActivity(groupId: string): Promise<Streak> {
    const streak = await this.getOrCreate(groupId);
    const now = new Date();

    if (!isValidActivityDay(streak.tipo, now)) {
      return streak;
    }

    const update = computeStreakUpdate(
      streak.tipo,
      streak.sequenciaAtual,
      streak.maiorSequencia,
      streak.ultimoRegistroEm,
      now,
    );

    streak.sequenciaAtual = update.sequenciaAtual;
    streak.maiorSequencia = update.maiorSequencia;
    streak.periodoAtualValido = update.periodoAtualValido;
    streak.ultimoRegistroEm = now;

    return this.streakRepository.save(streak);
  }

  async setTipo(groupId: string, tipo: StreakTipo): Promise<Streak> {
    const streak = await this.getOrCreate(groupId);

    if (streak.tipo === tipo) {
      return streak;
    }

    streak.tipo = tipo;
    streak.sequenciaAtual = 0;
    streak.maiorSequencia = 0;
    streak.ultimoRegistroEm = null;
    streak.periodoAtualValido = false;

    return this.streakRepository.save(streak);
  }
}
