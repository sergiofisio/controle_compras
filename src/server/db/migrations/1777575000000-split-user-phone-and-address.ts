import { MigrationInterface, QueryRunner } from "typeorm";

export class SplitUserPhoneAndAddress1777575000000 implements MigrationInterface {
  name = "SplitUserPhoneAndAddress1777575000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_phones" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "countryCode" character varying(3) NOT NULL,
        "areaCode" character varying(8) NOT NULL,
        "phone" character varying(20) NOT NULL,
        "type" character varying NOT NULL DEFAULT 'MOBILE',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_phones_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_user_phones_userId" ON "user_phones" ("userId")`);
    await queryRunner.query(`ALTER TABLE "user_phones" ADD CONSTRAINT "FK_user_phones_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

    await queryRunner.query(`
      CREATE TABLE "user_addresses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "country" character varying(2) NOT NULL,
        "zipcode" character varying,
        "street" character varying NOT NULL,
        "neighbour" character varying,
        "number" character varying,
        "complement" character varying,
        "city" character varying NOT NULL,
        "state" character varying,
        "reference" character varying,
        "type" character varying NOT NULL DEFAULT 'HOME',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_addresses_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_user_addresses_userId" ON "user_addresses" ("userId")`);
    await queryRunner.query(`ALTER TABLE "user_addresses" ADD CONSTRAINT "FK_user_addresses_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "phone"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "address"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "phone" character varying`);
    await queryRunner.query(`ALTER TABLE "users" ADD "address" character varying`);

    await queryRunner.query(`ALTER TABLE "user_addresses" DROP CONSTRAINT "FK_user_addresses_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_user_addresses_userId"`);
    await queryRunner.query(`DROP TABLE "user_addresses"`);

    await queryRunner.query(`ALTER TABLE "user_phones" DROP CONSTRAINT "FK_user_phones_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_user_phones_userId"`);
    await queryRunner.query(`DROP TABLE "user_phones"`);
  }
}
