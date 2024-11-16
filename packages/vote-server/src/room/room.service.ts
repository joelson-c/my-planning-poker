import { Injectable } from '@nestjs/common';
import { Prisma, VotingRoom, VotingUser } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { RoomMissingException } from './room.exception';

@Injectable()
export class RoomService {
    constructor(private readonly prisma: PrismaService) {}

    async getById(id: string, withUsers = false) {
        return this.prisma.votingRoom.findUnique({
            where: {
                id,
            },
            include: {
                users: withUsers,
            },
        });
    }

    async create(data: Prisma.VotingRoomCreateInput) {
        return this.prisma.votingRoom.create({
            data,
        });
    }

    async revealCards(roomId: VotingRoom['id']) {
        const room = await this.getById(roomId, true);
        if (!room) {
            throw new RoomMissingException(roomId);
        }

        if (room.state === 'REVEAL') {
            return this.getRoomVotes(room);
        }

        const updatedRoom = await this.prisma.votingRoom.update({
            select: {
                users: true,
            },
            where: {
                id: roomId,
            },
            data: {
                state: 'REVEAL',
            },
        });

        return this.getRoomVotes(updatedRoom);
    }

    async reset(roomId: VotingRoom['id']) {
        return this.prisma.votingRoom.update({
            where: {
                id: roomId,
            },
            data: {
                state: 'VOTING',
            },
        });
    }

    private getRoomVotes(room: { users: VotingUser[] }) {
        return room.users.map((user) => user.vote);
    }
}
