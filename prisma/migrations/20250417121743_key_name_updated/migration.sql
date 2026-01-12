/*
  Warnings:

  - You are about to drop the column `reportCount` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "reportCount",
ADD COLUMN     "report_count" INTEGER DEFAULT 0;
