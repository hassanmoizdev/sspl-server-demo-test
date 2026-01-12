/*
  Warnings:

  - A unique constraint covering the columns `[acc_id,poll_id,option_id]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Vote_acc_id_poll_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "Vote_acc_id_poll_id_option_id_key" ON "Vote"("acc_id", "poll_id", "option_id");
