import { MigrationInterface, QueryRunner } from "typeorm";

export class ExpandProductAndUser1775699280801 implements MigrationInterface {
    name = 'ExpandProductAndUser1775699280801'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "suppliers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "updated_by" character varying, "name" character varying NOT NULL, "tax_id" character varying, "contact_info" character varying, CONSTRAINT "PK_b70ac51766a9e3144f778cfe81e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" character varying NOT NULL, "product_id" uuid NOT NULL, "index" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_1974264ea7265989af8392f63a1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "cost_price"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "selling_price"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "products" ADD "sku" character varying`);
        await queryRunner.query(`UPDATE "products" SET "sku" = 'TEMP-' || id`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "sku" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ADD "supplier_id" uuid`);
        await queryRunner.query(`ALTER TABLE "products" ADD "purchase_price" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "products" ADD "ml_selling_price" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "products" ADD "direct_selling_price" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "products" ADD "is_listed_on_ml" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "products" ADD "created_by" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c44ac33a05b144dd0d9ddcf932" ON "products" ("sku") `);
        await queryRunner.query(`ALTER TABLE "product_images" ADD CONSTRAINT "FK_4f166bb8c2bfcef2498d97b4068" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_0ec433c1e1d444962d592d86c86" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_0ec433c1e1d444962d592d86c86"`);
        await queryRunner.query(`ALTER TABLE "product_images" DROP CONSTRAINT "FK_4f166bb8c2bfcef2498d97b4068"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c44ac33a05b144dd0d9ddcf932"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "is_listed_on_ml"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "direct_selling_price"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "ml_selling_price"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "purchase_price"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "supplier_id"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "sku"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "selling_price" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ADD "cost_price" numeric(10,2) NOT NULL`);
        await queryRunner.query(`DROP TABLE "product_images"`);
        await queryRunner.query(`DROP TABLE "suppliers"`);
    }

}
