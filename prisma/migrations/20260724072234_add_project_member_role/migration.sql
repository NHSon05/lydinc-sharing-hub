/*
  Warnings:

  - Added the required column `updatedAt` to the `ProjectMember` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectMemberRole" AS ENUM ('OWNER', 'MANAGER', 'MEMBER', 'VIEWER');

-- AlterTable: Add columns with defaults where needed
ALTER TABLE "ProjectMember" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "role" "ProjectMemberRole" NOT NULL DEFAULT 'MEMBER',
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- Backfill updatedAt for existing rows
UPDATE "ProjectMember" SET "updatedAt" = NOW() WHERE "updatedAt" IS NULL;

-- Make updatedAt required now that all rows have a value
ALTER TABLE "ProjectMember" ALTER COLUMN "updatedAt" SET NOT NULL;
