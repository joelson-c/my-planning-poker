import { Injectable } from '@nestjs/common';
import type {
    Prisma,
    VotingRoom,
    VotingUser,
    RoomState,
    VoteResult,
} from '@planningpoker/domain-models';
import { RoomClosedException, RoomMissingException } from './room.exception';
import { UserService } from 'src/user/user.service';
import { JoinedRoomMismatch } from 'src/core/core.exception';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoomService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly userService: UserService,
    ) {}

    async create(data: Prisma.VotingRoomCreateInput) {
        return this.prisma.votingRoom.create({
            data,
        });
    }

    async getById(roomId: VotingRoom['id']) {
        return this.prisma.votingRoom.findUnique({
            where: {
                id: roomId,
            },
        });
    }

    async getByIdWithUsers(roomId: VotingRoom['id']) {
        return this.prisma.votingRoom.findUnique({
            where: {
                id: roomId,
            },
            include: {
                users: true,
            },
        });
    }

    async getRoomVotes(roomId: VotingRoom['id']) {
        const room = await this.getByIdWithUsers(roomId);
        const votes = room.users.reduce(
            (acc, user) => ({
                ...acc,
                [user.id]: { vote: user.vote, nickname: user.nickname },
            }),
            {} as VoteResult,
        );

        return votes;
    }

    async updateState(roomId: VotingRoom['id'], state: RoomState) {
        return this.prisma.votingRoom.update({
            where: {
                id: roomId,
            },
            data: {
                state,
            },
        });
    }

    async joinUserToRoom(
        roomId: VotingRoom['id'],
        userId: VotingUser['id'],
        isObserver: boolean = false,
    ) {
        const roomToJoin = await this.getById(roomId);
        if (roomToJoin === null) {
            throw new RoomMissingException(roomId);
        }

        if (!roomToJoin.acceptConnections) {
            throw new RoomClosedException(roomId);
        }

        const [room, user] = await this.prisma.$transaction([
            this.prisma.votingRoom.update({
                where: {
                    id: roomId,
                },
                data: {
                    users: {
                        connect: {
                            id: userId,
                        },
                    },
                },
            }),
            this.prisma.votingUser.update({
                where: {
                    id: userId,
                },
                data: {
                    isObserver,
                },
            }),
        ]);

        return {
            room,
            user,
        };
    }

    async removeUserFromRoom(
        roomId: VotingRoom['id'],
        userId: VotingUser['id'],
    ) {
        const oldUser = await this.userService.getById(userId);
        if (oldUser.roomId !== roomId) {
            throw new JoinedRoomMismatch();
        }

        const [room, user] = await this.prisma.$transaction([
            this.prisma.votingRoom.update({
                where: {
                    id: roomId,
                },
                data: {
                    users: {
                        disconnect: {
                            id: userId,
                        },
                    },
                },
            }),

            this.prisma.votingUser.update({
                where: {
                    id: userId,
                },
                data: {
                    isObserver: false,
                    isAdmin: false,
                },
            }),
        ]);

        return {
            room,
            user,
        };
    }

    async assignNewAdmin(roomId: VotingRoom['id']) {
        const room = await this.getByIdWithUsers(roomId);
        if (!room) {
            return null;
        }

        const roomAdmin = room.users.find((user) => user.isAdmin);
        if (roomAdmin) {
            return roomAdmin.id;
        }

        const [oldestUser] = room.users.sort(
            (a, b) => a.connectedAt.getTime() - b.connectedAt.getTime(),
        );

        return oldestUser.id;
    }

    async resetVotes(roomId: VotingRoom['id']) {
        return this.prisma.votingUser.updateMany({
            where: {
                roomId,
            },
            data: {
                vote: null,
            },
        });
    }
}
