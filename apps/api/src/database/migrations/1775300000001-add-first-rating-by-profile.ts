import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFirstRatingByProfile1775300000001 implements MigrationInterface {
  name = 'AddFirstRatingByProfile1775300000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "watch_items"
        ADD COLUMN "first_rating_by_profile_id" uuid
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "watch_items"
        DROP COLUMN IF EXISTS "first_rating_by_profile_id"
    `);
  }
}
