-- AlterTable
ALTER TABLE "public"."MenuItem" ADD COLUMN     "hasStock" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "minStockAlert" INTEGER,
ADD COLUMN     "stockQuantity" INTEGER;
