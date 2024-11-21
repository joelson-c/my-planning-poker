import { Injectable } from '@nestjs/common';
import type {
    Prisma,
    VotingRoom,
    VotingUser,
} from '@planningpoker/domain-models';
import { RoomState } from '@planningpoker/domain-models';
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

        if (room.state === RoomState.REVEAL) {
            return {
                room,
                votes: this.getRoomVotes(room),
            };
        }

        const updatedRoom = await this.prisma.votingRoom.update({
            where: {
                id: roomId,
            },
            data: {
                state: RoomState.REVEAL,
            },
            include: {
                users: true,
            },
        });

        return {
            room: updatedRoom,
            votes: this.getRoomVotes(updatedRoom),
        };
    }

    async reset(roomId: VotingRoom['id']) {
        return this.prisma.votingRoom.update({
            where: {
                id: roomId,
            },
            data: {
                state: RoomState.VOTING,
            },
        });
    }

    private getRoomVotes(room: { users: VotingUser[] }) {
        return room.users.map((user) => user.vote);
    }
}
