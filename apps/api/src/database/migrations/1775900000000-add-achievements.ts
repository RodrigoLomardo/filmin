import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAchievements1775900000000 implements MigrationInterface {
  name = 'AddAchievements1775900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "achievements" (
        "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "group_id"     uuid              NOT NULL,
        "slug"         character varying(100) NOT NULL,
        "unlocked_at"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_achievements" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_achievements_group_slug" UNIQUE ("group_id", "slug")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_achievements_group_id" ON "achievements" ("group_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_achievements_group_id"`);
    await queryRunner.query(`DROP TABLE "achievements"`);
  }
}
