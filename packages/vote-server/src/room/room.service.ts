import { Injectable } from '@nestjs/common';
import type {
    Prisma,
    VotingRoom,
    VotingUser,
} from '@planningpoker/domain-models';
import { RoomState } from '@planningpoker/domain-models';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { RoomClosedException, RoomMissingException } from './room.exception';
import { UserService } from 'src/user/user.service';
import { JoinedRoomMismatch } from 'src/core/core.exception';

@Injectable()
export class RoomService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly userService: UserService,
    ) {}

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

    async create(data: Prisma.VotingRoomCreateInput) {
        return this.prisma.votingRoom.create({
            data,
        });
    }

    async revealCards(roomId: VotingRoom['id']) {
        const room = await this.getByIdWithUsers(roomId);
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

    private getRoomVotes(room: { users: VotingUser[] }) {
        return room.users.map((user) => user.vote);
    }
}
