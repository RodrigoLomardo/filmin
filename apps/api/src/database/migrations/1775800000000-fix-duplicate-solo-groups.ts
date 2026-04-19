import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Corrige duplicidade de grupos solo por perfil.
 *
 * Causa raiz: race condition no auto-provisionamento de grupo solo que
 * ocorria em todo request autenticado (JWT guard), permitindo que requisições
 * concorrentes criassem múltiplos grupos solo para o mesmo perfil durante
 * transições de tipo (solo→duo, duo→solo).
 *
 * Esta migration:
 * 1. Deduplica membros solo existentes — mantém o mais antigo por perfil
 * 2. Remove grupos solo orfãos (sem membros)
 * 3. Adiciona trigger que impede inserções duplicadas no nível do banco
 */
export class FixDuplicateSoloGroups1775800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Remove membros duplicados de grupos solo — mantém o mais antigo por perfil
    await queryRunner.query(`
      DELETE FROM group_members
      WHERE id IN (
        SELECT gm.id
        FROM group_members gm
        JOIN groups g ON g.id = gm.group_id
        WHERE g.tipo = 'solo'
          AND gm.joined_at > (
            SELECT MIN(gm2.joined_at)
            FROM group_members gm2
            JOIN groups g2 ON g2.id = gm2.group_id
            WHERE gm2.profile_id = gm.profile_id
              AND g2.tipo = 'solo'
          )
      )
    `);

    // 2. Remove grupos solo orfãos (sem membros) e seus dados dependentes
    // 2a. Remove pivot M:N de gêneros dos itens nesses grupos
    await queryRunner.query(`
      DELETE FROM watch_item_generos
      WHERE watch_item_id IN (
        SELECT wi.id FROM watch_items wi
        JOIN groups g ON g.id = wi.group_id
        WHERE g.tipo = 'solo'
          AND g.id NOT IN (SELECT group_id FROM group_members)
      )
    `);

    // 2b. Remove watch_items dos grupos orfãos (temporadas cascadeiam via FK)
    await queryRunner.query(`
      DELETE FROM watch_items
      WHERE group_id IN (
        SELECT id FROM groups
        WHERE tipo = 'solo'
          AND id NOT IN (SELECT group_id FROM group_members)
      )
    `);

    // 2c. Remove os grupos orfãos
    await queryRunner.query(`
      DELETE FROM groups
      WHERE tipo = 'solo'
        AND id NOT IN (SELECT group_id FROM group_members)
    `);

    // 3. Função trigger: bloqueia inserção de segundo grupo solo para o mesmo perfil
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_prevent_duplicate_solo_group()
      RETURNS TRIGGER AS $$
      BEGIN
        IF (SELECT tipo FROM groups WHERE id = NEW.group_id) = 'solo' THEN
          IF EXISTS (
            SELECT 1
            FROM group_members gm
            JOIN groups g ON g.id = gm.group_id
            WHERE gm.profile_id = NEW.profile_id
              AND g.tipo = 'solo'
          ) THEN
            RAISE EXCEPTION
              'Profile % already has a solo group membership',
              NEW.profile_id;
          END IF;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_prevent_duplicate_solo_group
        BEFORE INSERT ON group_members
        FOR EACH ROW EXECUTE FUNCTION fn_prevent_duplicate_solo_group()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_prevent_duplicate_solo_group ON group_members`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_prevent_duplicate_solo_group`);
  }
}
