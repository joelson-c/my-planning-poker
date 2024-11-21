-- CreateEnum
CREATE TYPE "CardTypes" AS ENUM ('FIBONACCI', 'SIZES');

-- CreateEnum
CREATE TYPE "RoomState" AS ENUM ('VOTING', 'REVEAL');

-- CreateTable
CREATE TABLE "VotingRoom" (
    "id" UUID NOT NULL,
    "cardType" "CardTypes" NOT NULL DEFAULT 'FIBONACCI',
    "state" "RoomState" NOT NULL DEFAULT 'VOTING',
    "acceptConnections" BOOLEAN NOT NULL,

    CONSTRAINT "VotingRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VotingUser" (
    "id" UUID NOT NULL,
    "roomId" UUID NOT NULL,
    "connectionId" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL,
    "isObserver" BOOLEAN NOT NULL,
    "vote" TEXT,
    "connectedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VotingUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VotingUser_connectionId_key" ON "VotingUser"("connectionId");

-- AddForeignKey
ALTER TABLE "VotingUser" ADD CONSTRAINT "VotingUser_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "VotingRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
