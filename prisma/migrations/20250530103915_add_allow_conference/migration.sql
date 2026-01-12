/*
  Warnings:

  - Added the required column `allow` to the `Conference` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conference" ADD COLUMN     "allow" TEXT NOT NULL DEFAULT 'ALL';
