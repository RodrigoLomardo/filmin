import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Habilita as extensões exigidas pelo schema.
 *
 * Todas as tabelas usam `uuid_generate_v4()` como default de PK, função que vem
 * da extensão `uuid-ossp`. No Supabase hospedado ela já está habilitada por
 * padrão, então as migrations sempre funcionaram — mas em um Postgres limpo
 * (ambiente de dev local) elas falhariam na primeira criação de tabela.
 *
 * Timestamp intencionalmente anterior ao primeiro `init` para rodar antes dele.
 * Idempotente: em bancos que já têm a extensão, é um no-op.
 */
export class EnableExtensions1774000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
  }

  public async down(): Promise<void> {
    // Não removemos extensões: outros objetos do banco dependem delas.
  }
}
