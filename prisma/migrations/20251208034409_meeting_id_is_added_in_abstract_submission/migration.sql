-- AlterTable
ALTER TABLE "AbstractSubmission" ADD COLUMN     "meetingId" INTEGER;

-- AddForeignKey
ALTER TABLE "AbstractSubmission" ADD CONSTRAINT "AbstractSubmission_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
