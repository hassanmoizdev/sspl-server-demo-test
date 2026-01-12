/*
  Warnings:

  - You are about to drop the column `discount` on the `MembershipPlan` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `MembershipPlan` table. All the data in the column will be lost.
  - The `type` column on the `MembershipPlan` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('MONTH', 'YEAR', 'LIFE');

-- AlterTable
ALTER TABLE "MembershipPlan" DROP COLUMN "discount",
DROP COLUMN "duration",
DROP COLUMN "type",
ADD COLUMN     "type" "PlanType" NOT NULL DEFAULT 'MONTH';
