import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoloGalleryFields1775500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "watch_items"
        ADD COLUMN IF NOT EXISTS "origin_group_id" uuid NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_watch_items_origin_group_id"
        ON "watch_items" ("origin_group_id")
        WHERE "origin_group_id" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_watch_items_origin_group_id"`);
    await queryRunner.query(`ALTER TABLE "watch_items" DROP COLUMN IF EXISTS "origin_group_id"`);
  }
}
