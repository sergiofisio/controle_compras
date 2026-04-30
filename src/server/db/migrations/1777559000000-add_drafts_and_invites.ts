import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDraftsAndInvites1777559000000 implements MigrationInterface {
  name = "AddDraftsAndInvites1777559000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "purchase_drafts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "familyId" uuid NOT NULL, "storeName" character varying, "cartItems" jsonb NOT NULL DEFAULT '[]', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_purchase_drafts_user_family" UNIQUE ("userId", "familyId"), CONSTRAINT "PK_purchase_drafts_id" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `CREATE TABLE "family_invites" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "familyId" uuid NOT NULL, "createdByUserId" uuid NOT NULL, "inviteCode" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "usedAt" TIMESTAMP WITH TIME ZONE, "usedByUserId" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_family_invites_code" UNIQUE ("inviteCode"), CONSTRAINT "PK_family_invites_id" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(`CREATE INDEX "IDX_purchase_drafts_family" ON "purchase_drafts" ("familyId")`);
    await queryRunner.query(`CREATE INDEX "IDX_family_invites_family" ON "family_invites" ("familyId")`);
    await queryRunner.query(`CREATE INDEX "IDX_family_invites_expires" ON "family_invites" ("expiresAt")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_family_invites_expires"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_family_invites_family"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_purchase_drafts_family"`);
    await queryRunner.query(`DROP TABLE "family_invites"`);
    await queryRunner.query(`DROP TABLE "purchase_drafts"`);
  }
}
