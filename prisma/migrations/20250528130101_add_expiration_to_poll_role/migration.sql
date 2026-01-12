-- AlterTable
ALTER TABLE "Poll" ADD COLUMN     "expires_at" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
