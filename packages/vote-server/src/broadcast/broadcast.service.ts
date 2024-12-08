import { Injectable } from '@nestjs/common';
import type {
    RoomState,
    VotingRoom,
    VotingUser,
    NewAdminEvent,
    NewRoomStateEvent,
} from '@planningpoker/domain-models';
import { CentrifugoService } from 'src/centrifugo/centrifgugo.service';
import { CHANNEL_PREFIX } from './constants';

@Injectable()
export class BroadcastService {
    constructor(private readonly centrifugoService: CentrifugoService) {}

    async broadcastRoomState(roomId: VotingRoom['id'], state: RoomState) {
        await this.centrifugoService.publish<NewRoomStateEvent>(
            this.getRoomChannel(roomId),
            {
                type: 'ROOM_STATE_UPDATE',
                state,
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
