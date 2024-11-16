import { ForbiddenException, Injectable } from '@nestjs/common';
import { VotingUser } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { ObserverVoteException } from './user.exception';

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

    async getById(id: VotingUser['id'], withRoom = false) {
        return this.prisma.votingUser.findUnique({
            where: {
                id,
            },
            include: {
                room: withRoom,
            },
        });
    }

    async addVote(id: VotingUser['id'], vote: VotingUser['vote']) {
        // TODO: Add vote value validation
        const user = await this.getById(id, true);
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
