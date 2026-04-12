import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1774047992523 implements MigrationInterface {
    name = 'Init1774047992523'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporadas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "watch_item_id" uuid NOT NULL, "numero" integer NOT NULL, "nota" numeric(3,1) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6a20b574356f3be254880927f83" UNIQUE ("watch_item_id", "numero"), CONSTRAINT "CHK_5cd45b0f12e2d62aab64ab4564" CHECK ("nota" >= 0 AND "nota" <= 10), CONSTRAINT "CHK_2ee5e1d818c54ce4bb797949b7" CHECK ("numero" > 0), CONSTRAINT "PK_a8b4bf9d1552c61b34d5ba94a71" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."watch_item_tipo_enum" AS ENUM('filme', 'serie')`);
        await queryRunner.query(`CREATE TYPE "public"."watch_item_status_enum" AS ENUM('quero_assistir', 'assistindo', 'assistido', 'abandonado')`);
        await queryRunner.query(`CREATE TABLE "watch_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "titulo" character varying(255) NOT NULL, "titulo_original" character varying(255), "ano_lancamento" integer NOT NULL, "tipo" "public"."watch_item_tipo_enum" NOT NULL, "status" "public"."watch_item_status_enum" NOT NULL, "nota_geral" numeric(3,1), "data_assistida" date, "rewatch_count" integer NOT NULL DEFAULT '0', "observacoes" text, "poster_url" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "CHK_91c482f0cd95fc5f3a65779178" CHECK ("rewatch_count" >= 0), CONSTRAINT "CHK_2a2ccb0018e4b760e7e0c6f328" CHECK ("nota_geral" IS NULL OR ("nota_geral" >= 0 AND "nota_geral" <= 10)), CONSTRAINT "CHK_d869c06b20ddf0dfdaddd33828" CHECK ("ano_lancamento" >= 1888), CONSTRAINT "PK_c08ba20bf7aff6bad217c27a157" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_60b5225755fcba0c4afe117398" ON "watch_items" ("ano_lancamento") `);
        await queryRunner.query(`CREATE INDEX "IDX_c929d972b78262af6b21bc82db" ON "watch_items" ("tipo") `);
        await queryRunner.query(`CREATE INDEX "IDX_c200c09cdcd51332cf6a25b93a" ON "watch_items" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_c9016129f6f07544765c018747" ON "watch_items" ("data_assistida") `);
        await queryRunner.query(`CREATE INDEX "IDX_49651cb6ba64fe450d0a9b1bf7" ON "watch_items" ("created_at") `);
        await queryRunner.query(`CREATE TABLE "generos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying(100) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ca5699facd76195709c23565660" UNIQUE ("nome"), CONSTRAINT "PK_7ebe7a16bcbfd533d6445d74fef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "watch_item_generos" ("watch_item_id" uuid NOT NULL, "genero_id" uuid NOT NULL, CONSTRAINT "PK_807f20a53ded00070574657e37b" PRIMARY KEY ("watch_item_id", "genero_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ffe2ce1a7a9e7d4922e6d1afb4" ON "watch_item_generos" ("watch_item_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_d81bcef60dd7dc3a3b411e1e6d" ON "watch_item_generos" ("genero_id") `);
        await queryRunner.query(`ALTER TABLE "temporadas" ADD CONSTRAINT "FK_6e043c49b3e92d76045c6a619cf" FOREIGN KEY ("watch_item_id") REFERENCES "watch_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "watch_item_generos" ADD CONSTRAINT "FK_ffe2ce1a7a9e7d4922e6d1afb4f" FOREIGN KEY ("watch_item_id") REFERENCES "watch_items"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "watch_item_generos" ADD CONSTRAINT "FK_d81bcef60dd7dc3a3b411e1e6de" FOREIGN KEY ("genero_id") REFERENCES "generos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "watch_item_generos" DROP CONSTRAINT "FK_d81bcef60dd7dc3a3b411e1e6de"`);
        await queryRunner.query(`ALTER TABLE "watch_item_generos" DROP CONSTRAINT "FK_ffe2ce1a7a9e7d4922e6d1afb4f"`);
        await queryRunner.query(`ALTER TABLE "temporadas" DROP CONSTRAINT "FK_6e043c49b3e92d76045c6a619cf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d81bcef60dd7dc3a3b411e1e6d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ffe2ce1a7a9e7d4922e6d1afb4"`);
        await queryRunner.query(`DROP TABLE "watch_item_generos"`);
        await queryRunner.query(`DROP TABLE "generos"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_49651cb6ba64fe450d0a9b1bf7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c9016129f6f07544765c018747"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c200c09cdcd51332cf6a25b93a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c929d972b78262af6b21bc82db"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_60b5225755fcba0c4afe117398"`);
        await queryRunner.query(`DROP TABLE "watch_items"`);
        await queryRunner.query(`DROP TYPE "public"."watch_item_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."watch_item_tipo_enum"`);
        await queryRunner.query(`DROP TABLE "temporadas"`);
    }

}
