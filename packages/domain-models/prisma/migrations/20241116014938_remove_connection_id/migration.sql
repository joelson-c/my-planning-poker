/*
  Warnings:

  - You are about to drop the column `connectionId` on the `VotingUser` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "VotingUser_connectionId_key";

-- AlterTable
ALTER TABLE "VotingUser" DROP COLUMN "connectionId",
ALTER COLUMN "connectedAt" SET DEFAULT CURRENT_TIMESTAMP;
