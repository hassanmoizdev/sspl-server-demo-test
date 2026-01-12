/*
  Warnings:

  - The primary key for the `QuestionResponse` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `creator_id` on the `QuestionResponse` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `QuestionResponse` table. All the data in the column will be lost.
  - You are about to drop the column `session_id` on the `QuestionResponse` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[submission_id,question_id]` on the table `QuestionResponse` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `submission_id` to the `QuestionResponse` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "QuestionResponse" DROP CONSTRAINT "QuestionResponse_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "QuestionResponse" DROP CONSTRAINT "QuestionResponse_session_id_fkey";

-- AlterTable
ALTER TABLE "QuestionResponse" DROP CONSTRAINT "QuestionResponse_pkey",
DROP COLUMN "creator_id",
DROP COLUMN "id",
DROP COLUMN "session_id",
ADD COLUMN     "submission_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "QuestionnaireSubmission" (
    "id" SERIAL NOT NULL,
    "submitter_id" INTEGER NOT NULL,
    "session_id" INTEGER,
    "conference_id" INTEGER,

    CONSTRAINT "QuestionnaireSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionResponse_submission_id_question_id_key" ON "QuestionResponse"("submission_id", "question_id");

-- AddForeignKey
ALTER TABLE "QuestionnaireSubmission" ADD CONSTRAINT "QuestionnaireSubmission_submitter_id_fkey" FOREIGN KEY ("submitter_id") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireSubmission" ADD CONSTRAINT "QuestionnaireSubmission_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireSubmission" ADD CONSTRAINT "QuestionnaireSubmission_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "Conference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionResponse" ADD CONSTRAINT "QuestionResponse_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "QuestionnaireSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
