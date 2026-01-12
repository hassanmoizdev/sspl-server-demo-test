/*
  Warnings:

  - The `allow` column on the `Conference` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Conference" DROP COLUMN "allow",
ADD COLUMN     "allow" TEXT[] DEFAULT ARRAY['ALL']::TEXT[];
