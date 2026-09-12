/*
  Warnings:

  - You are about to drop the column `sku` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `products` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "product_variants_sku_key";

-- DropIndex
DROP INDEX "products_sku_key";

-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "sku";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "sku";
