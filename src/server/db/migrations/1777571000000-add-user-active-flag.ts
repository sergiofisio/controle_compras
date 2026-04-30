import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserActiveFlag1777571000000 implements MigrationInterface {
  name = "AddUserActiveFlag1777571000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "isActive" boolean NOT NULL DEFAULT true`);
    await queryRunner.query(`UPDATE "users" SET "isActive" = true WHERE "isActive" IS NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_users_isActive" ON "users" ("isActive")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_users_isActive"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isActive"`);
  }
}
