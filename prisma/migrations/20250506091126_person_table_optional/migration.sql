-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';
ALTER TYPE "Role" ADD VALUE 'OFFICE_BEARERS';
ALTER TYPE "Role" ADD VALUE 'LIFE_MEMBER';
ALTER TYPE "Role" ADD VALUE 'REGULAR_MEMBER';

-- AlterTable
ALTER TABLE "Person" ALTER COLUMN "first_name" DROP NOT NULL;
