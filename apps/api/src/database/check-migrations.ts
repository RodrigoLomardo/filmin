/**
 * Valida que a sequência completa de migrations roda em um banco limpo.
 *
 * Executa: `npm run db:check`
 *
 * Usa um banco temporário na mesma instância local, então **não destrói** os
 * dados do banco de trabalho. É a checagem a rodar antes de abrir PR — pega
 * migration quebrada ou dependente de estado preexistente.
 */

import 'dotenv/config';
import { DataSource } from 'typeorm';
import { assertSafeToMutate } from '../common/config/environment';

const CHECK_DB = 'filmin_migration_check';

function buildUrl(database: string): string {
  const url = new URL(process.env.DATABASE_URL as string);
  url.pathname = `/${database}`;
  return url.toString();
}

async function main(): Promise<void> {
  assertSafeToMutate('db:check');

  const admin = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: false,
  });
  await admin.initialize();

  try {
    await admin.query(`DROP DATABASE IF EXISTS "${CHECK_DB}"`);
    await admin.query(`CREATE DATABASE "${CHECK_DB}"`);
    console.log(`Banco temporário criado: ${CHECK_DB}`);

    const target = new DataSource({
      type: 'postgres',
      url: buildUrl(CHECK_DB),
      ssl: false,
      migrations: ['src/database/migrations/*.ts'],
      synchronize: false,
      logging: false,
    });

    await target.initialize();
    const executadas = await target.runMigrations();
    const tabelas = await target.query<{ total: number }[]>(
      `SELECT count(*)::int AS total FROM information_schema.tables WHERE table_schema = 'public'`,
    );
    await target.destroy();

    console.log(`✓ ${executadas.length} migrations aplicadas em banco limpo`);
    console.log(`✓ ${tabelas[0].total} tabelas criadas`);
  } finally {
    await admin.query(`DROP DATABASE IF EXISTS "${CHECK_DB}"`);
    console.log(`Banco temporário removido`);
    await admin.destroy();
  }
}

main().catch((error: unknown) => {
  console.error(
    '\n✗ db:check falhou:',
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
