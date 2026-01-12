/*
  Warnings:

  - You are about to drop the column `acc_id` on the `Poll` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Poll" DROP CONSTRAINT "Poll_acc_id_fkey";

-- AlterTable
ALTER TABLE "Poll" DROP COLUMN "acc_id";
