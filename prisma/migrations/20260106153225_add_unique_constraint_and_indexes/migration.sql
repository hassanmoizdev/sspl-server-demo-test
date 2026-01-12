/*
  Warnings:

  - A unique constraint covering the columns `[participant_id,question_id]` on the table `ScenarioResponse` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `ScenarioParticipant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ScenarioParticipant" ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ScenarioResponse_participant_id_question_id_key" ON "ScenarioResponse"("participant_id", "question_id");

-- CreateIndex
CREATE INDEX "ScenarioSession_join_code_idx" ON "ScenarioSession"("join_code");

-- CreateIndex
CREATE INDEX "ScenarioSession_expires_at_idx" ON "ScenarioSession"("expires_at");
