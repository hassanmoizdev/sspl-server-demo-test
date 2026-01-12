/*
  Warnings:

  - You are about to drop the column `session_id` on the `Questionnaire` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Questionnaire" DROP CONSTRAINT "Questionnaire_session_id_fkey";

-- DropIndex
DROP INDEX "QuestionResponse_question_id_creator_id_key";

-- DropIndex
DROP INDEX "Questionnaire_session_id_key";

-- AlterTable
ALTER TABLE "QuestionResponse" ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "session_id" INTEGER,
ADD CONSTRAINT "QuestionResponse_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Questionnaire" DROP COLUMN "session_id";

-- AddForeignKey
ALTER TABLE "QuestionResponse" ADD CONSTRAINT "QuestionResponse_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
