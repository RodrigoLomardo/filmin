import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1774107605038 implements MigrationInterface {
    name = 'Init1774107605038'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "temporadas" DROP CONSTRAINT "CHK_5cd45b0f12e2d62aab64ab4564"`);
        await queryRunner.query(`ALTER TABLE "temporadas" DROP COLUMN "nota"`);
        await queryRunner.query(`ALTER TABLE "temporadas" ADD "nota_dele" numeric(3,1)`);
        await queryRunner.query(`ALTER TABLE "temporadas" ADD "nota_dela" numeric(3,1)`);
        await queryRunner.query(`ALTER TABLE "temporadas" ADD "nota_geral" numeric(3,1)`);
        await queryRunner.query(`ALTER TABLE "watch_items" ADD "nota_dele" numeric(3,1)`);
        await queryRunner.query(`ALTER TABLE "watch_items" ADD "nota_dela" numeric(3,1)`);
        await queryRunner.query(`ALTER TABLE "temporadas" ADD CONSTRAINT "CHK_b6de370191575d52db375c51cd" CHECK ("nota_geral" IS NULL OR ("nota_geral" >= 0 AND "nota_geral" <= 10))`);
        await queryRunner.query(`ALTER TABLE "temporadas" ADD CONSTRAINT "CHK_220d9af9c845696b5ac9961572" CHECK ("nota_dela" IS NULL OR ("nota_dela" >= 0 AND "nota_dela" <= 10))`);
        await queryRunner.query(`ALTER TABLE "temporadas" ADD CONSTRAINT "CHK_e679bfa7b6b484faf540e16592" CHECK ("nota_dele" IS NULL OR ("nota_dele" >= 0 AND "nota_dele" <= 10))`);
        await queryRunner.query(`ALTER TABLE "watch_items" ADD CONSTRAINT "CHK_71e95ea82ffbd661358829ddb0" CHECK ("nota_dela" IS NULL OR ("nota_dela" >= 0 AND "nota_dela" <= 10))`);
        await queryRunner.query(`ALTER TABLE "watch_items" ADD CONSTRAINT "CHK_0fa97e254b1a8c7fbdcb079504" CHECK ("nota_dele" IS NULL OR ("nota_dele" >= 0 AND "nota_dele" <= 10))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "watch_items" DROP CONSTRAINT "CHK_0fa97e254b1a8c7fbdcb079504"`);
        await queryRunner.query(`ALTER TABLE "watch_items" DROP CONSTRAINT "CHK_71e95ea82ffbd661358829ddb0"`);
        await queryRunner.query(`ALTER TABLE "temporadas" DROP CONSTRAINT "CHK_e679bfa7b6b484faf540e16592"`);
        await queryRunner.query(`ALTER TABLE "temporadas" DROP CONSTRAINT "CHK_220d9af9c845696b5ac9961572"`);
        await queryRunner.query(`ALTER TABLE "temporadas" DROP CONSTRAINT "CHK_b6de370191575d52db375c51cd"`);
        await queryRunner.query(`ALTER TABLE "watch_items" DROP COLUMN "nota_dela"`);
        await queryRunner.query(`ALTER TABLE "watch_items" DROP COLUMN "nota_dele"`);
        await queryRunner.query(`ALTER TABLE "temporadas" DROP COLUMN "nota_geral"`);
        await queryRunner.query(`ALTER TABLE "temporadas" DROP COLUMN "nota_dela"`);
        await queryRunner.query(`ALTER TABLE "temporadas" DROP COLUMN "nota_dele"`);
        await queryRunner.query(`ALTER TABLE "temporadas" ADD "nota" numeric(3,1) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "temporadas" ADD CONSTRAINT "CHK_5cd45b0f12e2d62aab64ab4564" CHECK (((nota >= (0)::numeric) AND (nota <= (10)::numeric)))`);
    }

}
