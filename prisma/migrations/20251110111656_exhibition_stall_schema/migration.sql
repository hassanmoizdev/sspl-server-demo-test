-- CreateEnum
CREATE TYPE "SponsorCategory" AS ENUM ('BASIC', 'GOLD', 'SILVER', 'BRONZE', 'PARTNER');

-- CreateTable
CREATE TABLE "ExhibitionStall" (
    "id" SERIAL NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "stall_no" TEXT NOT NULL,
    "category" "SponsorCategory" NOT NULL DEFAULT 'BASIC',
    "company_name" TEXT NOT NULL,
    "contact_person" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExhibitionStall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stall_id" INTEGER,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExhibitionStall_creator_id_key" ON "ExhibitionStall"("creator_id");

-- AddForeignKey
ALTER TABLE "ExhibitionStall" ADD CONSTRAINT "ExhibitionStall_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_stall_id_fkey" FOREIGN KEY ("stall_id") REFERENCES "ExhibitionStall"("id") ON DELETE SET NULL ON UPDATE CASCADE;
