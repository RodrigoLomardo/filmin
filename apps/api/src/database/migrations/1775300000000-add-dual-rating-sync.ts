import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDualRatingSync1775300000000 implements MigrationInterface {
  name = 'AddDualRatingSync1775300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."rating_status_enum" AS ENUM('complete', 'awaiting_partner')`,
    );

    await queryRunner.query(`
      ALTER TABLE "watch_items"
        ADD COLUMN "rating_status"          "public"."rating_status_enum",
        ADD COLUMN "pending_for_profile_id" uuid,
        ADD COLUMN "last_rating_at"         timestamptz
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_watch_items_rating_status" ON "watch_items" ("rating_status")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_watch_items_pending_for_profile_id" ON "watch_items" ("pending_for_profile_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_watch_items_pending_for_profile_id"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_watch_items_rating_status"`,
    );

    await queryRunner.query(`
      ALTER TABLE "watch_items"
        DROP COLUMN IF EXISTS "rating_status",
        DROP COLUMN IF EXISTS "pending_for_profile_id",
        DROP COLUMN IF EXISTS "last_rating_at"
    `);

    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."rating_status_enum"`,
    );
  }
}
