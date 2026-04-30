import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPurchaseItemPromotions1777557000000 implements MigrationInterface {
  name = "AddPurchaseItemPromotions1777557000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "purchase_items" ADD "discountType" character varying NOT NULL DEFAULT 'none'`);
    await queryRunner.query(`ALTER TABLE "purchase_items" ADD "discountPercent" double precision`);
    await queryRunner.query(`ALTER TABLE "purchase_items" ADD "promoQty" integer`);
    await queryRunner.query(`ALTER TABLE "purchase_items" ADD "promoPrice" double precision`);
    await queryRunner.query(`ALTER TABLE "purchase_items" ADD "lineTotal" double precision NOT NULL DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "purchase_items" ADD "finalUnitPrice" double precision NOT NULL DEFAULT '0'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "purchase_items" DROP COLUMN "finalUnitPrice"`);
    await queryRunner.query(`ALTER TABLE "purchase_items" DROP COLUMN "lineTotal"`);
    await queryRunner.query(`ALTER TABLE "purchase_items" DROP COLUMN "promoPrice"`);
    await queryRunner.query(`ALTER TABLE "purchase_items" DROP COLUMN "promoQty"`);
    await queryRunner.query(`ALTER TABLE "purchase_items" DROP COLUMN "discountPercent"`);
    await queryRunner.query(`ALTER TABLE "purchase_items" DROP COLUMN "discountType"`);
  }
}
