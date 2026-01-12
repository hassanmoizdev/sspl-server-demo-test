/*
  Warnings:

  - A unique constraint covering the columns `[acc_id,poll_id]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.
  - Made the column `first_name` on table `Person` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Vote_acc_id_poll_id_option_id_key";

-- AlterTable
ALTER TABLE "Person" ALTER COLUMN "first_name" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Vote_acc_id_poll_id_key" ON "Vote"("acc_id", "poll_id");
