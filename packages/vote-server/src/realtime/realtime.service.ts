import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Subscription } from './subscription/subscription.interface';
import type { Connection } from './connection/connection.interface';
import type { Token } from 'src/auth/token/token.interface';
import { RoomService } from 'src/room/room.service';
import { UserService } from 'src/user/user.service';
import type { VotingRoom, VotingUser } from '@planningpoker/domain-models';
import {
    RoomMissingException,
    RoomClosedException,
} from 'src/room/room.exception';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class RealtimeService {
    private readonly TOKEN_ISSUER = 'voting_server';
    private readonly CHANNEL_PREFIX = 'vote';

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly roomService: RoomService,
        private readonly userService: UserService,
    ) {}

    async generateConnectionToken(token: Token) {
        const payload = {
            sub: token.sub,
            iss: this.TOKEN_ISSUER,
            aud: 'connection',
        } satisfies Connection;

        return this.jwtService.signAsync(payload, {
            expiresIn: '10m',
        });
    }

    async generateSubscriptionToken(
        token: Token,
        roomId: string,
        isObserver: boolean,
    ) {
        const { room } = await this.joinUser(roomId, token.sub);

        const payload = {
            sub: token.sub,
            iss: this.TOKEN_ISSUER,
            aud: 'subscription',
            channel: room.channel,
            info: { nickname: token.nickname, isObserver },
        } satisfies Subscription;

        return this.jwtService.signAsync(payload, {
            expiresIn: '5m',
        });
    }

    async revokeSubscription(userId: VotingUser['id']) {
        const user = await this.userService.getById(userId);
        if (!user) {
            return;
        }

        await this.removeUser(user.roomId, userId);

        return user;
    }

    async joinUser(
        roomId: VotingRoom['id'],
        userId: VotingUser['id'],
        isObserver: boolean = false,
    ) {
        const room = await this.roomService.getById(roomId);
        if (room === null) {
            throw new RoomMissingException(roomId);
        }

        if (!room.acceptConnections) {
            throw new RoomClosedException(roomId);
        }

        const prismaClient = this.prisma.$extends({
            result: {
                votingRoom: {
                    channel: {
                        needs: {
                            id: true,
                        },
                        compute: ({ id }) => `${this.CHANNEL_PREFIX}:${id}`,
                    },
                },
            },
        });
        const [updatedRoom, updatedUser] = await prismaClient.$transaction([
            prismaClient.votingRoom.update({
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
            prismaClient.votingUser.update({
                where: {
                    id: userId,
                },
                data: {
                    isObserver,
                },
            }),
        ]);

        return {
            room: updatedRoom,
            user: updatedUser,
        };
    }

    async removeUser(roomId: VotingRoom['id'], userId: VotingUser['id']) {
        const [updatedRoom] = await this.prisma.$transaction([
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

        return updatedRoom;
    }

    async assignNewAdmin(roomId: VotingRoom['id']) {
        const room = await this.roomService.getById(roomId, true);
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

    async getSubscription(userId: VotingUser['id']) {
        return this.userService.getById(userId);
    }
}
