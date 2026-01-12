-- AlterEnum
ALTER TYPE "QuestionTypes" ADD VALUE 'YESNO';

-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "statement" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Questionnaire" ADD COLUMN     "description" TEXT;
