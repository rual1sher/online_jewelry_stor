-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "packaging_id" TEXT,
ADD COLUMN     "packaging_price" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "packagings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packagings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "packagings_name_key" ON "packagings"("name");

-- CreateIndex
CREATE INDEX "orders_packaging_id_idx" ON "orders"("packaging_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_packaging_id_fkey" FOREIGN KEY ("packaging_id") REFERENCES "packagings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
