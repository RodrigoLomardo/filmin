import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1774109164004 implements MigrationInterface {
    name = 'Init1774109164004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."watch_item_tipo_enum" RENAME TO "watch_item_tipo_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."watch_item_tipo_enum" AS ENUM('filme', 'serie', 'livro')`);
        await queryRunner.query(`ALTER TABLE "watch_items" ALTER COLUMN "tipo" TYPE "public"."watch_item_tipo_enum" USING "tipo"::"text"::"public"."watch_item_tipo_enum"`);
        await queryRunner.query(`DROP TYPE "public"."watch_item_tipo_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."watch_item_tipo_enum_old" AS ENUM('filme', 'serie')`);
        await queryRunner.query(`ALTER TABLE "watch_items" ALTER COLUMN "tipo" TYPE "public"."watch_item_tipo_enum_old" USING "tipo"::"text"::"public"."watch_item_tipo_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."watch_item_tipo_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."watch_item_tipo_enum_old" RENAME TO "watch_item_tipo_enum"`);
    }

}
