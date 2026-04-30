import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserProfileFieldsAndStoreFamily1777568000000 implements MigrationInterface {
  name = "AddUserProfileFieldsAndStoreFamily1777568000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "phone" character varying`);
    await queryRunner.query(`ALTER TABLE "users" ADD "address" character varying`);
    await queryRunner.query(`ALTER TABLE "users" ADD "avatarUrl" character varying`);

    await queryRunner.query(`ALTER TABLE "stores" ADD "familyId" uuid`);

    await queryRunner.query(`
      UPDATE "stores" s
      SET "familyId" = sub."familyId"
      FROM (
        SELECT DISTINCT ON ("familyId") "familyId"
        FROM "family_members"
        ORDER BY "familyId"
      ) sub
      WHERE s."familyId" IS NULL
    `);

    await queryRunner.query(`
      UPDATE "stores"
      SET "familyId" = (
        SELECT "familyId" FROM "family_members" ORDER BY "id" LIMIT 1
      )
      WHERE "familyId" IS NULL
    `);

    await queryRunner.query(`ALTER TABLE "stores" ALTER COLUMN "familyId" SET NOT NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_stores_family_name_type" ON "stores" ("familyId", "name", "type")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_stores_family_name_type"`);
    await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "familyId"`);

    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatarUrl"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
  }
}
