import { DataSource } from 'typeorm';
import { assertSafeToMutate } from '../../common/config/environment';

/**
 * Tabelas de domínio do Filmin, na ordem inversa de dependência.
 * `profiles` e `groups` vêm por último porque o resto referencia os dois.
 *
 * `migrations` fica intencionalmente de fora: limpar a tabela faria o TypeORM
 * reexecutar tudo. Para recriar o schema use `supabase db reset`.
 */
const DOMAIN_TABLES = [
  'nudges',
  'theo_memories',
  'achievements',
  'streaks',
  'profile_viewers',
  'watch_item_generos',
  'temporadas',
  'watch_items',
  'generos',
  'group_members',
  'groups',
  'profiles',
];

/**
 * Limpa todos os dados de domínio preservando o schema.
 *
 * Protegido por `assertSafeToMutate` — a checagem é repetida aqui de propósito,
 * para que a função seja segura mesmo se chamada de outro ponto.
 */
export async function truncateDomainTables(ds: DataSource): Promise<void> {
  assertSafeToMutate('truncate');

  const lista = DOMAIN_TABLES.map((t) => `"${t}"`).join(', ');
  await ds.query(`TRUNCATE TABLE ${lista} RESTART IDENTITY CASCADE`);
}
