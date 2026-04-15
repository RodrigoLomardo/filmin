import { MigrationInterface, QueryRunner } from 'typeorm';

export class AnoLancamentoNullable1775300000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "watch_items"
        ALTER COLUMN "ano_lancamento" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "watch_items"
        ALTER COLUMN "ano_lancamento" SET NOT NULL
    `);
  }
}
