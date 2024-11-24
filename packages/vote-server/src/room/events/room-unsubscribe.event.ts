import type { VotingRoom, VotingUser } from '@prisma/client';

export const ROOM_UNSUBSCRIBE_EVENT = Symbol('room_unsubscribe');

export class RoomUnsubscribeEvent {
    constructor(
        public readonly user: VotingUser,
        public readonly room: VotingRoom,
    ) {}
}
