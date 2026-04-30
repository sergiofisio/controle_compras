import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoriesBrandsAndUnits1777562000000 implements MigrationInterface {
  name = "AddCategoriesBrandsAndUnits1777562000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "familyId" uuid, "isGlobal" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_categories_id" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `CREATE TABLE "brands" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "categoryId" uuid, "familyId" uuid, "isGlobal" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_brands_id" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(`ALTER TABLE "shopping_list_items" ADD "categoryId" uuid`);
    await queryRunner.query(`ALTER TABLE "shopping_list_items" ADD "brandId" uuid`);
    await queryRunner.query(`ALTER TABLE "shopping_list_items" ADD "unit" character varying NOT NULL DEFAULT 'unidade'`);

    await queryRunner.query(`ALTER TABLE "purchase_items" ADD "categoryId" uuid`);
    await queryRunner.query(`ALTER TABLE "purchase_items" ADD "brandId" uuid`);
    await queryRunner.query(`ALTER TABLE "purchase_items" ADD "unit" character varying NOT NULL DEFAULT 'unidade'`);

    const defaults = [
      "Alimentos",
      "Bebidas",
      "Higiene Pessoal",
      "Limpeza",
      "Cama, Mesa e Banho",
      "Farmacia e Saude",
      "Bebes e Infantil",
      "Pets",
      "Utilidades Domesticas",
    ];

    for (const name of defaults) {
      await queryRunner.query(`INSERT INTO "categories" ("name", "isGlobal") VALUES ($1, true)`, [name]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "purchase_items" DROP COLUMN "unit"`);
    await queryRunner.query(`ALTER TABLE "purchase_items" DROP COLUMN "brandId"`);
    await queryRunner.query(`ALTER TABLE "purchase_items" DROP COLUMN "categoryId"`);

    await queryRunner.query(`ALTER TABLE "shopping_list_items" DROP COLUMN "unit"`);
    await queryRunner.query(`ALTER TABLE "shopping_list_items" DROP COLUMN "brandId"`);
    await queryRunner.query(`ALTER TABLE "shopping_list_items" DROP COLUMN "categoryId"`);

    await queryRunner.query(`DROP TABLE "brands"`);
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
