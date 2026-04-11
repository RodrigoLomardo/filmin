import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFirstRatingField1775300000002 implements MigrationInterface {
  name = 'AddFirstRatingField1775300000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."rating_field_enum" AS ENUM('dele', 'dela')`,
    );

    await queryRunner.query(`
      ALTER TABLE "watch_items"
        ADD COLUMN "first_rating_field" "public"."rating_field_enum"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "watch_items"
        DROP COLUMN IF EXISTS "first_rating_field"
    `);

    await queryRunner.query(`DROP TYPE IF EXISTS "public"."rating_field_enum"`);
  }
}
