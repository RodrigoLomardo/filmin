import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuthDomain1775174400000 implements MigrationInterface {
  name = 'AddAuthDomain1775174400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enum de tipo de grupo
    await queryRunner.query(
      `CREATE TYPE "public"."group_tipo_enum" AS ENUM('solo', 'duo')`,
    );

    // Tabela de grupos (workspace compartilhado)
    await queryRunner.query(`
      CREATE TABLE "groups" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tipo" "public"."group_tipo_enum" NOT NULL,
        "invite_code" character varying(64),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_groups_invite_code" UNIQUE ("invite_code"),
        CONSTRAINT "PK_groups" PRIMARY KEY ("id")
      )
    `);

    // Tabela de perfis (1 por usuário Supabase)
    await queryRunner.query(`
      CREATE TABLE "profiles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "supabase_user_id" uuid NOT NULL,
        "email" character varying(255),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_profiles_supabase_user_id" UNIQUE ("supabase_user_id"),
        CONSTRAINT "PK_profiles" PRIMARY KEY ("id")
      )
    `);

    // Tabela de membros do grupo (relaciona profiles <-> groups)
    await queryRunner.query(`
      CREATE TABLE "group_members" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "group_id" uuid NOT NULL,
        "profile_id" uuid NOT NULL,
        "joined_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_group_members_group_profile" UNIQUE ("group_id", "profile_id"),
        CONSTRAINT "PK_group_members" PRIMARY KEY ("id"),
        CONSTRAINT "FK_group_members_group" FOREIGN KEY ("group_id")
          REFERENCES "groups"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_group_members_profile" FOREIGN KEY ("profile_id")
          REFERENCES "profiles"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_group_members_group_id" ON "group_members" ("group_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_group_members_profile_id" ON "group_members" ("profile_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_group_members_profile_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_group_members_group_id"`);
    await queryRunner.query(`DROP TABLE "group_members"`);
    await queryRunner.query(`DROP TABLE "profiles"`);
    await queryRunner.query(`DROP TABLE "groups"`);
    await queryRunner.query(`DROP TYPE "public"."group_tipo_enum"`);
  }
}
