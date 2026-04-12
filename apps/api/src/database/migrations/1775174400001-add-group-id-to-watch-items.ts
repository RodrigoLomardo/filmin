import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGroupIdToWatchItems1775174400001 implements MigrationInterface {
  name = 'AddGroupIdToWatchItems1775174400001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Adiciona group_id como nullable para permitir o backfill
    await queryRunner.query(
      `ALTER TABLE "watch_items" ADD "group_id" uuid`,
    );

    // 2. Backfill: cria um grupo bootstrap do tipo 'duo' para os dados existentes
    //    e atribui todos os watch_items a ele
    const result: { id: string }[] = await queryRunner.query(
      `INSERT INTO "groups" ("tipo") VALUES ('duo') RETURNING "id"`,
    );
    const bootstrapGroupId = result[0].id;

    await queryRunner.query(
      `UPDATE "watch_items" SET "group_id" = $1`,
      [bootstrapGroupId],
    );

    // 3. Aplica NOT NULL agora que todos os registros têm group_id
    await queryRunner.query(
      `ALTER TABLE "watch_items" ALTER COLUMN "group_id" SET NOT NULL`,
    );

    // 4. FK e índice
    await queryRunner.query(
      `ALTER TABLE "watch_items" ADD CONSTRAINT "FK_watch_items_group"
       FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_watch_items_group_id" ON "watch_items" ("group_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_watch_items_group_id"`);
    await queryRunner.query(
      `ALTER TABLE "watch_items" DROP CONSTRAINT "FK_watch_items_group"`,
    );
    await queryRunner.query(
      `ALTER TABLE "watch_items" DROP COLUMN "group_id"`,
    );
    // Nota: o grupo bootstrap criado no up() NÃO é removido no down()
    // para evitar perda acidental de dados caso já existam members vinculados.
  }
}
