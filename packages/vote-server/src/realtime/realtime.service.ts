import type { Subscription } from './subscription/subscription.interface';
import type { Connection } from './connection/connection.interface';
import type { Token } from 'src/auth/token/token.interface';
import type { VotingUser } from '@planningpoker/domain-models';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { JoinedRoomMismatch } from 'src/core/core.exception';
import { CHANNEL_PREFIX } from 'src/broadcast/constants';

@Injectable()
export class RealtimeService {
    private readonly TOKEN_ISSUER = 'voting_server';

    constructor(
        private readonly jwtService: JwtService,
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
        const user = await this.userService.getByToken(token);
        if (user.roomId !== roomId) {
            throw new JoinedRoomMismatch();
        }

        const payload = {
            sub: token.sub,
            iss: this.TOKEN_ISSUER,
            aud: 'subscription',
            channel: `${CHANNEL_PREFIX}:${roomId}`,
            info: { nickname: token.nickname, isObserver },
        } satisfies Subscription;

        return this.jwtService.signAsync(payload, {
            expiresIn: '5m',
        });
    }

    async getSubscription(userId: VotingUser['id']) {
        return this.userService.getById(userId);
    }
}
