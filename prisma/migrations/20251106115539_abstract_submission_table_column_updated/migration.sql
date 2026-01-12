/*
  Warnings:

  - A unique constraint covering the columns `[creator_id]` on the table `AbstractSubmission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creator_id` to the `AbstractSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AbstractSubmission" ADD COLUMN     "creator_id" INTEGER NOT NULL,
ADD COLUMN     "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "AbstractSubmission_creator_id_key" ON "AbstractSubmission"("creator_id");

-- AddForeignKey
ALTER TABLE "AbstractSubmission" ADD CONSTRAINT "AbstractSubmission_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
