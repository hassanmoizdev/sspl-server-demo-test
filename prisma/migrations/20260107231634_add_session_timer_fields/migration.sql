-- AlterTable
ALTER TABLE "ScenarioResponse" ADD COLUMN     "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ScenarioSession" ADD COLUMN     "current_question_index" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "current_question_started_at" TIMESTAMP(3),
ADD COLUMN     "started_at" TIMESTAMP(3);
