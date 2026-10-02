/**
 * Seed completa do ambiente de desenvolvimento.
 *
 * Executa: `npm run db:seed` (na raiz) ou `npm run seed:dev -w @filmin/api`
 *
 * Idempotente por recriação: limpa as tabelas de domínio e reconstrói todos os
 * cenários. Protegida por `assertSafeToMutate` — aborta se o `DATABASE_URL` não
 * for local ou se `APP_ENV` não for `development`.
 */

import 'dotenv/config';
import dataSource from '../../database/data-source';
import {
  assertSafeToMutate,
  maskDatabaseUrl,
} from '../../common/config/environment';
import { GroupTipo } from '../../common/enums/group-tipo.enum';
import { NudgeType } from '../../common/enums/nudge-type.enum';
import { Nudge } from '../../modules/nudges/entities/nudge.entity';
import { Profile } from '../../modules/profiles/entities/profile.entity';
import { ProfileViewer } from '../../modules/profiles/entities/profile-viewer.entity';
import { TheoMemory } from '../../modules/theo/entities/theo-memory.entity';
import {
  criarAchievements,
  criarGrupo,
  criarItens,
  criarProfiles,
  criarStreak,
  seedGeneros,
} from './dev-builders';
import {
  CONVITE_ITEMS,
  DUO_ITEMS,
  PRIVADO_ITEMS,
  SOLO_ITEMS,
  THEO_HISTORY,
} from './dev-fixtures';
import { DEV_PASSWORD, ensureDevAuthUsers } from './dev-users';
import { truncateDomainTables } from './truncate-domain';

async function main(): Promise<void> {
  assertSafeToMutate('seed:dev');

  console.log(`\nBanco alvo: ${maskDatabaseUrl()}\n`);

  console.log('1. Usuários no Supabase Auth local');
  const users = await ensureDevAuthUsers();

  const ds = await dataSource.initialize();

  try {
    console.log('\n2. Limpando tabelas de domínio');
    await truncateDomainTables(ds);

    console.log('3. Gêneros');
    const generos = await seedGeneros(ds);

    console.log('4. Perfis');
    const profiles = await criarProfiles(ds, users);
    const get = (key: string): Profile => {
      const profile = profiles.get(key);
      if (!profile) throw new Error(`Perfil de teste ausente: ${key}`);
      return profile;
    };

    console.log('5. Grupos');
    // Todo usuário com dados tem um solo; o duo prevalece como grupo ativo.
    const soloPai = await criarGrupo(ds, GroupTipo.SOLO, [get('pai')]);
    const soloMae = await criarGrupo(ds, GroupTipo.SOLO, [get('mae')]);
    const soloRico = await criarGrupo(ds, GroupTipo.SOLO, [get('solo')]);
    const soloPrivado = await criarGrupo(ds, GroupTipo.SOLO, [get('privado')]);
    const soloConvite = await criarGrupo(ds, GroupTipo.SOLO, [get('convite')]);
    const duo = await criarGrupo(
      ds,
      GroupTipo.DUO,
      [get('pai'), get('mae')],
      'DEVDUO01',
    );
    const duoAberto = await criarGrupo(
      ds,
      GroupTipo.DUO,
      [get('convite')],
      'DEVJOIN1',
    );
    // 'novato' fica sem grupo de propósito: valida onboarding e GroupGuard.

    console.log('6. Acervos');
    const totalDuo = await criarItens(ds, duo.id, DUO_ITEMS, generos, profiles);
    const totalSolo = await criarItens(
      ds,
      soloRico.id,
      SOLO_ITEMS,
      generos,
      profiles,
    );
    const totalPrivado = await criarItens(
      ds,
      soloPrivado.id,
      PRIVADO_ITEMS,
      generos,
      profiles,
    );
    const totalConvite = await criarItens(
      ds,
      duoAberto.id,
      CONVITE_ITEMS,
      generos,
      profiles,
    );

    console.log('7. Streaks');
    // Faixas de cor: 0–9 laranja, 10–29 amarelo, 30–59 azul, 60+ roxo.
    await criarStreak(ds, duo.id, 35, 41);
    await criarStreak(ds, soloRico.id, 12, 18);
    await criarStreak(ds, soloPrivado.id, 65, 65);
    await criarStreak(ds, duoAberto.id, 3, 7);
    await criarStreak(ds, soloPai.id, 0, 9);
    await criarStreak(ds, soloMae.id, 0, 4);
    await criarStreak(ds, soloConvite.id, 0, 2);

    console.log('8. Conquistas');
    await criarAchievements(ds, duo.id, [
      'cinefilo_nivel_1',
      'maratonista_nivel_1',
      'alma_gemea',
    ]);
    await criarAchievements(ds, soloRico.id, [
      'cinefilo_nivel_1',
      'leitor_avido_nivel_1',
      'colecionador_nivel_1',
    ]);

    console.log('9. Memória do Theo');
    await ds.getRepository(TheoMemory).save({
      groupId: duo.id,
      sessionId: 'dev-session',
      recentTitles: ['Interestelar', 'Cidade de Deus', 'Soul'],
      conversationHistory: THEO_HISTORY,
    });

    console.log('10. Visitantes de perfil (Stalkers)');
    await ds.getRepository(ProfileViewer).save([
      { viewedProfileId: get('privado').id, viewerProfileId: get('pai').id },
      { viewedProfileId: get('privado').id, viewerProfileId: get('solo').id },
      { viewedProfileId: get('pai').id, viewerProfileId: get('mae').id },
      { viewedProfileId: get('solo').id, viewerProfileId: get('privado').id },
    ]);

    console.log('11. Nudge pendente');
    await ds.getRepository(Nudge).save({
      groupId: duo.id,
      type: NudgeType.CONTINUITY,
      message: 'Vocês pararam The Bear na temporada 2. Bora terminar?',
      data: { titulo: 'The Bear' },
      readAt: null,
    });

    console.log('\n✓ Seed de dev concluída\n');
    console.log(
      `  Grupo duo (pai+mãe):    ${totalDuo} itens — convite DEVDUO01`,
    );
    console.log(`  Grupo solo rico:        ${totalSolo} itens`);
    console.log(`  Grupo perfil privado:   ${totalPrivado} itens`);
    console.log(
      `  Duo aberto:             ${totalConvite} itens — convite DEVJOIN1`,
    );
    console.log(`\n  Senha de todos os usuários: ${DEV_PASSWORD}`);
    console.log('  Usuários:');
    for (const user of users) {
      console.log(`    ${user.email}`);
    }
    console.log('');
  } finally {
    await ds.destroy();
  }
}

main().catch((error: unknown) => {
  console.error(
    '\n✗ Erro ao executar seed de dev:',
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
