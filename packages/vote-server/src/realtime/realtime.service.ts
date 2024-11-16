import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Subscription } from './subscription/subscription.interface';
import { Connection } from './connection/connection.interface';
import { Token } from 'src/auth/token/token.interface';
import { RoomService } from 'src/room/room.service';
import { UserService } from 'src/user/user.service';
import { VotingRoom, VotingUser } from '@prisma/client';
import {
    RoomMissingException,
    RoomClosedException,
} from 'src/room/room.exception';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class RealtimeService {
    private readonly issuer = 'voting_server';

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly roomService: RoomService,
        private readonly userService: UserService,
    ) {}

    async generateConnectionToken(token: Token) {
        const payload = {
            sub: token.sub,
            iss: this.issuer,
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
        await this.joinUser(roomId, token.sub);

        const payload = {
            sub: token.sub,
            iss: this.issuer,
            aud: 'subscription',
            channel: roomId,
            info: { nickname: token.nickname, isObserver },
        } satisfies Subscription;

        return {
            token: await this.jwtService.signAsync(payload, {
                expiresIn: '5m',
            }),
            newAdminId: await this.assignNewAdmin(roomId),
        };
    }

    async revokeSubscription(userId: VotingUser['id']) {
        const user = await this.userService.getById(userId);
        if (!user) {
            return;
        }

        await this.removeUser(user.roomId, userId);

        return {
            newAdminId: await this.assignNewAdmin(user.roomId),
        };
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

        const [updatedRoom] = await this.prisma.$transaction([
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

        return updatedRoom;
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
