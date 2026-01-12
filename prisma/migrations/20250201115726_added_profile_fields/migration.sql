/*
  Warnings:

  - You are about to drop the column `designation` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "designation",
ADD COLUMN     "country" TEXT,
ADD COLUMN     "institute" TEXT;
