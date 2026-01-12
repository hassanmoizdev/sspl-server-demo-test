-- CreateEnum
CREATE TYPE "ActiveStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DELETED');

-- AlterTable
ALTER TABLE "Conference" ADD COLUMN     "active_status" "ActiveStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Guest" ADD COLUMN     "active_status" "ActiveStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "active_status" "ActiveStatus" NOT NULL DEFAULT 'ACTIVE';

-- DropEnum
DROP TYPE "ExistanceStatus";
