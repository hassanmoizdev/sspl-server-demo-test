/*
  Warnings:

  - Added the required column `acc_id` to the `PostLiking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PostLiking" ADD COLUMN     "acc_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "PostLiking" ADD CONSTRAINT "PostLiking_acc_id_fkey" FOREIGN KEY ("acc_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
