import { VotingUser } from '@prisma/client';

export const ROOM_UNSUBSCRIBE_EVENT = Symbol('room_unsubscribe');

export class RoomUnsubscribeEvent {
    readonly userId: VotingUser['id'];
    readonly roomId: VotingUser['roomId'];

    constructor(userId: VotingUser['id'], roomId: VotingUser['roomId']) {
        this.userId = userId;
        this.roomId = roomId;
    }
}
