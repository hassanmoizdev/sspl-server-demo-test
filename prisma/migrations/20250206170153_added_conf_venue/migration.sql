-- AlterTable
ALTER TABLE "Conference" ADD COLUMN     "venue_id" INTEGER,
ADD COLUMN     "web_link" TEXT;

-- AddForeignKey
ALTER TABLE "Conference" ADD CONSTRAINT "Conference_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
