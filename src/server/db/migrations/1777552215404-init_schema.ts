import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1777552215404 implements MigrationInterface {
    name = 'InitSchema1777552215404'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "name" character varying NOT NULL, "passwordHash" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "families" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_70414ac0c8f45664cf71324b9bb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "family_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "familyId" uuid NOT NULL, "userId" uuid NOT NULL, "role" character varying NOT NULL DEFAULT 'member', CONSTRAINT "UQ_5763ba432d6370ef7a17fbb0b24" UNIQUE ("familyId", "userId"), CONSTRAINT "PK_186da7c7fcbf23775fdd888a747" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "stores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "type" character varying NOT NULL, CONSTRAINT "PK_7aa6e7d71fa7acdd7ca43d7c9cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "category" character varying, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "shopping_lists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "familyId" uuid NOT NULL, CONSTRAINT "PK_9289ace7dd5e768d65290f3f9de" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "shopping_list_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "listId" uuid NOT NULL, "name" character varying NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "checked" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_043c112c02fdc1c39fbd619fadb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "purchases" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "familyId" uuid NOT NULL, "storeName" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1d55032f37a34c6eceacbbca6b8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "purchase_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "purchaseId" uuid NOT NULL, "productName" character varying NOT NULL, "price" double precision NOT NULL, "quantity" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_e3d9bea880baad86ff6de3290da" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "price_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "productName" character varying NOT NULL, "storeName" character varying NOT NULL, "price" double precision NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e41e25472373d4b574b153229e9" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "price_history"`);
        await queryRunner.query(`DROP TABLE "purchase_items"`);
        await queryRunner.query(`DROP TABLE "purchases"`);
        await queryRunner.query(`DROP TABLE "shopping_list_items"`);
        await queryRunner.query(`DROP TABLE "shopping_lists"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "stores"`);
        await queryRunner.query(`DROP TABLE "family_members"`);
        await queryRunner.query(`DROP TABLE "families"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
