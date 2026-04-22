import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTheoMemoryHistory1776000000001 implements MigrationInterface {
  name = 'AddTheoMemoryHistory1776000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "theo_memories"
        ADD COLUMN IF NOT EXISTS "conversation_history" jsonb NOT NULL DEFAULT '[]'
    `);

    // Remove context_summary — não é mais utilizado
    await queryRunner.query(`
      ALTER TABLE "theo_memories"
        DROP COLUMN IF EXISTS "context_summary"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "theo_memories"
        ADD COLUMN IF NOT EXISTS "context_summary" text
    `);
    await queryRunner.query(`
      ALTER TABLE "theo_memories"
        DROP COLUMN IF EXISTS "conversation_history"
    `);
  }
}
