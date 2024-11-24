import type { VotingRoom, VotingUser } from '@prisma/client';

export const NEW_ROOM_SUBSCRIPTION_EVENT = Symbol('new_room_subscription');

export class NewRoomSubscriptionEvent {
    constructor(
        public readonly user: VotingUser,
        public readonly room: VotingRoom,
    ) {}
}
