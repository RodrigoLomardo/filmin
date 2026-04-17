import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStreaks1775400000000 implements MigrationInterface {
  name = 'AddStreaks1775400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."streaks_tipo_enum" AS ENUM ('daily', 'weekend', 'monthly')
    `);

    await queryRunner.query(`
      CREATE TABLE "streaks" (
        "id"                  uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "group_id"            character varying NOT NULL,
        "tipo"                "public"."streaks_tipo_enum" NOT NULL DEFAULT 'daily',
        "sequencia_atual"     integer           NOT NULL DEFAULT 0,
        "maior_sequencia"     integer           NOT NULL DEFAULT 0,
        "ultimo_registro_em"  TIMESTAMPTZ,
        "periodo_atual_valido" boolean          NOT NULL DEFAULT false,
        "criado_em"           TIMESTAMPTZ       NOT NULL DEFAULT now(),
        "atualizado_em"       TIMESTAMPTZ       NOT NULL DEFAULT now(),
        CONSTRAINT "PK_streaks" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_streaks_group_id" UNIQUE ("group_id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "streaks"`);
    await queryRunner.query(`DROP TYPE "public"."streaks_tipo_enum"`);
  }
}
