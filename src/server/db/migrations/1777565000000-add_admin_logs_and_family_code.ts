import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdminLogsAndFamilyCode1777565000000 implements MigrationInterface {
  name = "AddAdminLogsAndFamilyCode1777565000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "isAdmin" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "families" ADD "inviteCode" character varying`);

    await queryRunner.query(`UPDATE "families" SET "inviteCode" = upper(replace(substring("id"::text, 1, 8), '-', '')) WHERE "inviteCode" IS NULL`);
    await queryRunner.query(`ALTER TABLE "families" ALTER COLUMN "inviteCode" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "families" ADD CONSTRAINT "UQ_families_inviteCode" UNIQUE ("inviteCode")`);

    await queryRunner.query(
      `CREATE TABLE "access_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "action" character varying NOT NULL, "email" character varying, "ip" character varying, "metadata" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_access_logs_id" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(`CREATE INDEX "IDX_access_logs_action_createdAt" ON "access_logs" ("action", "createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_access_logs_userId" ON "access_logs" ("userId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_access_logs_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_access_logs_action_createdAt"`);
    await queryRunner.query(`DROP TABLE "access_logs"`);

    await queryRunner.query(`ALTER TABLE "families" DROP CONSTRAINT "UQ_families_inviteCode"`);
    await queryRunner.query(`ALTER TABLE "families" DROP COLUMN "inviteCode"`);

    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isAdmin"`);
  }
}
