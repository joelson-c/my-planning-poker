import { VotingUser } from '@prisma/client';

export const NEW_ROOM_SUBSCRIPTION_EVENT = Symbol('new_room_subscription');

export class NewRoomSubscriptionEvent {
    readonly userId: VotingUser['id'];
    readonly roomId: VotingUser['roomId'];

    constructor(userId: VotingUser['id'], roomId: VotingUser['roomId']) {
        this.userId = userId;
        this.roomId = roomId;
    }
}
