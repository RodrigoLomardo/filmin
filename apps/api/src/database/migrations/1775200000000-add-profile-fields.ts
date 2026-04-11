import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfileFields1775200000000 implements MigrationInterface {
  name = 'AddProfileFields1775200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."profile_genero_enum" AS ENUM('masculino', 'feminino', 'outro', 'prefiro_nao_dizer')`,
    );

    await queryRunner.query(`
      ALTER TABLE "profiles"
        ADD COLUMN "first_name"  character varying(100),
        ADD COLUMN "last_name"   character varying(100),
        ADD COLUMN "genero"      "public"."profile_genero_enum"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "profiles"
        DROP COLUMN IF EXISTS "first_name",
        DROP COLUMN IF EXISTS "last_name",
        DROP COLUMN IF EXISTS "genero"
    `);

    await queryRunner.query(`DROP TYPE IF EXISTS "public"."profile_genero_enum"`);
  }
}
