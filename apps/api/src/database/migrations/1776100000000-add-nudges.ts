import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNudges1776100000000 implements MigrationInterface {
  name = 'AddNudges1776100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."nudge_type_enum" AS ENUM ('session', 'continuity', 'inactivity')
    `);

    await queryRunner.query(`
      CREATE TABLE "nudges" (
        "id"         UUID NOT NULL DEFAULT gen_random_uuid(),
        "group_id"   UUID NOT NULL,
        "type"       "public"."nudge_type_enum" NOT NULL,
        "message"    TEXT NOT NULL,
        "data"       JSONB,
        "read_at"    TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_nudges" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_nudges_group_id"  ON "nudges" ("group_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_nudges_read_at"   ON "nudges" ("read_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_nudges_created"   ON "nudges" ("created_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_nudges_created"`);
    await queryRunner.query(`DROP INDEX "IDX_nudges_read_at"`);
    await queryRunner.query(`DROP INDEX "IDX_nudges_group_id"`);
    await queryRunner.query(`DROP TABLE "nudges"`);
    await queryRunner.query(`DROP TYPE "public"."nudge_type_enum"`);
  }
}
