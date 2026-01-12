/*
  Warnings:

  - You are about to drop the column `acc_id` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `acc_id` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `acc_id` on the `PostLiking` table. All the data in the column will be lost.
  - You are about to drop the column `acc_id` on the `Vote` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[creator_id,poll_id]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creator_id` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creator_id` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creator_id` to the `PostLiking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creator_id` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_acc_id_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_acc_id_fkey";

-- DropForeignKey
ALTER TABLE "PostLiking" DROP CONSTRAINT "PostLiking_acc_id_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_acc_id_fkey";

-- DropIndex
DROP INDEX "Vote_acc_id_poll_id_key";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "acc_id",
ADD COLUMN     "creator_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "acc_id",
ADD COLUMN     "creator_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PostLiking" DROP COLUMN "acc_id",
ADD COLUMN     "creator_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Vote" DROP COLUMN "acc_id",
ADD COLUMN     "creator_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Vote_creator_id_poll_id_key" ON "Vote"("creator_id", "poll_id");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLiking" ADD CONSTRAINT "PostLiking_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
