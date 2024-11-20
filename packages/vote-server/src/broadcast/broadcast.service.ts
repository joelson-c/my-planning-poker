import { Injectable } from '@nestjs/common';
import { VotingRoom, VotingUser } from '@prisma/client';
import { CentrifugoService } from 'src/centrifugo/centrifgugo.service';
import { NewAdminEvent, RoomResetEvent, VoteRevealEvent } from './interfaces';

@Injectable()
export class BroadcastService {
    constructor(private readonly centrifugoService: CentrifugoService) {}

    async broadcastRoomReset(roomId: VotingRoom['id']) {
        await this.centrifugoService.publish<RoomResetEvent>(roomId, {
            type: 'ROOM_RESET',
        });
    }

    async broadcastVoteReveal(
        roomId: VotingRoom['id'],
        votes: VotingUser['vote'][],
    ) {
        await this.centrifugoService.publish<VoteRevealEvent>(roomId, {
            type: 'VOTE_REVEAL',
            votes,
        });
    }

    async broadcastNewAdmin(roomId: string, newAdminId: VotingUser['id']) {
        await this.centrifugoService.publish<NewAdminEvent>(roomId, {
            type: 'NEW_ADMIN',
            newAdminId,
        });
    }
}
