import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfileViewers1775700000000 implements MigrationInterface {
  name = 'AddProfileViewers1775700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "profile_viewers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "viewed_profile_id" uuid NOT NULL,
        "viewer_profile_id" uuid NOT NULL,
        "viewed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UQ_profile_viewers_pair" UNIQUE ("viewed_profile_id", "viewer_profile_id"),
        CONSTRAINT "PK_profile_viewers" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "profile_viewers"
        ADD CONSTRAINT "FK_profile_viewers_viewed"
          FOREIGN KEY ("viewed_profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE,
        ADD CONSTRAINT "FK_profile_viewers_viewer"
          FOREIGN KEY ("viewer_profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "profile_viewers"`);
  }
}
