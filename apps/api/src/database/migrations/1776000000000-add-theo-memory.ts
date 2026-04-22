import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTheoMemory1776000000000 implements MigrationInterface {
  name = 'AddTheoMemory1776000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "theo_memories" (
        "id"               uuid                     NOT NULL DEFAULT uuid_generate_v4(),
        "group_id"         uuid                     NOT NULL,
        "session_id"       character varying(64)    NOT NULL,
        "context_summary"  text,
        "recent_titles"    jsonb                    NOT NULL DEFAULT '[]',
        "updated_at"       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_theo_memories" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_theo_memories_group_session" UNIQUE ("group_id", "session_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_theo_memories_group_id" ON "theo_memories" ("group_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_theo_memories_group_id"`);
    await queryRunner.query(`DROP TABLE "theo_memories"`);
  }
}
