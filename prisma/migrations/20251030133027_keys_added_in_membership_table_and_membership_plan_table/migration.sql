-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "plan_id" INTEGER;

-- AlterTable
ALTER TABLE "MembershipPlan" ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 0;
