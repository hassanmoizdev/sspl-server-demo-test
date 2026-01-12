/*
  Warnings:

  - You are about to drop the column `conferenceId` on the `Certificate` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_conferenceId_fkey";

-- AlterTable
ALTER TABLE "Certificate" DROP COLUMN "conferenceId",
ADD COLUMN     "sessionId" INTEGER;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
