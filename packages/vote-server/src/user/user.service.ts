import type { VotingRoom, VotingUser } from '@planningpoker/domain-models';
import type { Token } from 'src/auth/token/token.interface';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ObserverVoteException } from './user.exception';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async createAnonymous(nickname: VotingUser['nickname']) {
        return this.prisma.votingUser.create({
            data: {
                nickname,
            },
        });
    }

    async refreshUser(userId: VotingUser['id']) {
        await this.prisma.votingUser.update({
            where: {
                id: userId,
            },
            data: {
                // Just update timestamp so we won't delete the user in cleanup job
                updatedAt: new Date(),
            },
        });
    }

    async getById(userId: VotingUser['id']) {
        return this.prisma.votingUser.findUnique({
            where: {
                id: userId,
            },
        });
    }

    async getByIdWithRoom(userId: VotingUser['id']) {
        return this.prisma.votingUser.findUnique({
            where: {
                id: userId,
            },
            include: {
                room: true,
            },
        });
    }

    async getByToken(token: Token) {
        return this.getById(token.sub);
    }

    async getAdminUserByRoom(roomId: VotingRoom['id']) {
        return this.prisma.votingUser.findFirst({
            where: {
                roomId,
                isAdmin: true,
            },
        });
    }

    async addVote(id: VotingUser['id'], vote: VotingUser['vote']) {
        // TODO: Add vote value validation
        const user = await this.getByIdWithRoom(id);
        if (!user) {
            throw new Error('User not found');
        }

        if (!user.room) {
            throw new ForbiddenException('User is not in a room');
        }

        if (user.isObserver) {
            throw new ObserverVoteException();
        }

        return this.prisma.votingUser.update({
            where: {
                id,
            },
            data: {
                vote,
            },
        });
    }
}
