/*
  Warnings:

  - You are about to drop the `mark` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Supermarket` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `markId` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Item" ADD COLUMN     "markId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."mark";

-- CreateTable
CREATE TABLE "public"."Mark" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mark_name_key" ON "public"."Mark"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Supermarket_name_key" ON "public"."Supermarket"("name");

-- AddForeignKey
ALTER TABLE "public"."Item" ADD CONSTRAINT "Item_markId_fkey" FOREIGN KEY ("markId") REFERENCES "public"."Mark"("id") ON DELETE CASCADE ON UPDATE CASCADE;
