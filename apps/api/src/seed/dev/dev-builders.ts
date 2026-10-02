/**
 * Construtores usados pela seed de dev.
 *
 * Mantidos separados do orquestrador (`seed-dev.ts`) para que cada arquivo tenha
 * uma responsabilidade só: aqui é "como criar", lá é "o que criar".
 */

import { DataSource } from 'typeorm';
import { GroupTipo } from '../../common/enums/group-tipo.enum';
import { StreakTipo } from '../../common/enums/streak-tipo.enum';
import { Achievement } from '../../modules/achievements/entities/achievement.entity';
import { Genero } from '../../modules/generos/entities/genero.entity';
import { Group } from '../../modules/groups/entities/group.entity';
import { GroupMember } from '../../modules/groups/entities/group-member.entity';
import { Profile } from '../../modules/profiles/entities/profile.entity';
import { Streak } from '../../modules/streak/streak.entity';
import { Temporada } from '../../modules/temporadas/entities/temporada.entity';
import { WatchItem } from '../../modules/watch-items/entities/watch-item.entity';
import { GENEROS_PADRAO } from '../generos-padrao';
import { ItemFixture } from './dev-fixtures';
import { DevUser } from './dev-users';

function diasAtrasParaData(dias: number): Date {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  return data;
}

export async function seedGeneros(
  ds: DataSource,
): Promise<Map<string, Genero>> {
  const repo = ds.getRepository(Genero);
  await repo.save(GENEROS_PADRAO.map((nome) => ({ nome })));
  const todos = await repo.find();
  return new Map(todos.map((g) => [g.nome, g]));
}

export async function criarProfiles(
  ds: DataSource,
  users: DevUser[],
): Promise<Map<string, Profile>> {
  const criados = await ds.getRepository(Profile).save(
    users.map((user) => ({
      supabaseUserId: user.supabaseUserId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      genero: user.genero,
      isPrivate: user.isPrivate ?? false,
    })),
  );

  return new Map(users.map((user, i) => [user.key, criados[i]]));
}

export async function criarGrupo(
  ds: DataSource,
  tipo: GroupTipo,
  membros: Profile[],
  inviteCode?: string,
): Promise<Group> {
  const group = await ds
    .getRepository(Group)
    .save({ tipo, inviteCode: inviteCode ?? null });

  await ds
    .getRepository(GroupMember)
    .save(
      membros.map((profile) => ({ groupId: group.id, profileId: profile.id })),
    );

  return group;
}

/** Cria os WatchItems de um grupo, com gêneros e temporadas. */
export async function criarItens(
  ds: DataSource,
  groupId: string,
  fixtures: ItemFixture[],
  generos: Map<string, Genero>,
  profilesPorChave: Map<string, Profile>,
): Promise<number> {
  const itemRepo = ds.getRepository(WatchItem);
  const temporadaRepo = ds.getRepository(Temporada);

  for (const fixture of fixtures) {
    const dataAssistida = fixture.diasAtras
      ? diasAtrasParaData(fixture.diasAtras)
      : null;

    const item = await itemRepo.save({
      titulo: fixture.titulo,
      tipo: fixture.tipo,
      status: fixture.status,
      anoLancamento: fixture.ano ?? null,
      notaDele: fixture.notaDele ?? null,
      notaDela: fixture.notaDela ?? null,
      notaGeral: fixture.notaGeral ?? null,
      dataAssistida,
      rewatchCount: fixture.rewatchCount ?? 0,
      observacoes: fixture.observacoes ?? null,
      ratingStatus: fixture.ratingStatus ?? null,
      pendingForProfileId: fixture.pendingFor
        ? (profilesPorChave.get(fixture.pendingFor)?.id ?? null)
        : null,
      firstRatingByProfileId: fixture.firstRatingBy
        ? (profilesPorChave.get(fixture.firstRatingBy)?.id ?? null)
        : null,
      firstRatingField: fixture.firstRatingField ?? null,
      lastRatingAt: dataAssistida,
      groupId,
      generos: (fixture.generos ?? [])
        .map((nome) => generos.get(nome))
        .filter((g): g is Genero => !!g),
    });

    // created_at é gerenciado pelo TypeORM; alinhamos ao cenário para que a
    // retrospectiva por período encontre dados distribuídos no tempo.
    if (dataAssistida) {
      await itemRepo.update(item.id, { createdAt: dataAssistida });
    }

    if (fixture.temporadas?.length) {
      await temporadaRepo.save(
        fixture.temporadas.map((t) => ({
          watchItemId: item.id,
          numero: t.numero,
          notaDele: t.notaDele ?? null,
          notaDela: t.notaDela ?? null,
          notaGeral: t.notaGeral ?? null,
        })),
      );
    }
  }

  return fixtures.length;
}

export async function criarStreak(
  ds: DataSource,
  groupId: string,
  sequencia: number,
  maior: number,
): Promise<void> {
  await ds.getRepository(Streak).save({
    groupId,
    tipo: StreakTipo.DAILY,
    sequenciaAtual: sequencia,
    maiorSequencia: maior,
    ultimoRegistroEm: new Date(),
    periodoAtualValido: true,
  });
}

export async function criarAchievements(
  ds: DataSource,
  groupId: string,
  slugs: string[],
): Promise<void> {
  await ds
    .getRepository(Achievement)
    .save(slugs.map((slug) => ({ groupId, slug })));
}
