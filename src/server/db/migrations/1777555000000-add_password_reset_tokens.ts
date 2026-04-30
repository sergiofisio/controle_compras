import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPasswordResetTokens1777555000000 implements MigrationInterface {
  name = "AddPasswordResetTokens1777555000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "password_reset_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "tokenHash" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "usedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_password_reset_tokens_token_hash" UNIQUE ("tokenHash"), CONSTRAINT "PK_password_reset_tokens_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_password_reset_tokens_user_id" ON "password_reset_tokens" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_password_reset_tokens_expires_at" ON "password_reset_tokens" ("expiresAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_password_reset_tokens_expires_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_password_reset_tokens_user_id"`);
    await queryRunner.query(`DROP TABLE "password_reset_tokens"`);
  }
}
