/*
  Warnings:

  - You are about to drop the column `role` on the `Poll` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Poll" DROP COLUMN "role",
ADD COLUMN     "allow" TEXT NOT NULL DEFAULT '';
