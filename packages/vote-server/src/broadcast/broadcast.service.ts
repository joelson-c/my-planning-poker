import { Injectable } from '@nestjs/common';
import type { VotingRoom, VotingUser } from '@planningpoker/domain-models';
import type {
    NewAdminEvent,
    RoomResetEvent,
    VoteRevealEvent,
} from '@planningpoker/domain-models';
import { CentrifugoService } from 'src/centrifugo/centrifgugo.service';
import { CHANNEL_PREFIX } from './constants';

@Injectable()
export class BroadcastService {
    constructor(private readonly centrifugoService: CentrifugoService) {}

    async broadcastRoomReset(roomId: VotingRoom['id']) {
        await this.centrifugoService.publish<RoomResetEvent>(
            this.getRoomChannel(roomId),
            {
                type: 'ROOM_RESET',
            },
        );
    }

    async broadcastVoteReveal(
        roomId: VotingRoom['id'],
        votes: VotingUser['vote'][],
    ) {
        await this.centrifugoService.publish<VoteRevealEvent>(
            this.getRoomChannel(roomId),
            {
                type: 'VOTE_REVEAL',
                votes,
            },
        );
    }

    async broadcastNewAdmin(roomId: string, newAdminId: VotingUser['id']) {
        await this.centrifugoService.publish<NewAdminEvent>(
            this.getRoomChannel(roomId),
            {
                type: 'NEW_ADMIN',
                newAdminId,
            },
        );
    }

    private getRoomChannel(roomId: VotingRoom['id']) {
        return `${CHANNEL_PREFIX}:${roomId}`;
    }
}
