import type { VotingRoom, VotingUser } from '@planningpoker/domain-models';

export const ROOM_UNSUBSCRIBE_EVENT = Symbol('room_unsubscribe');

export class RoomUnsubscribeEvent {
    constructor(
        public readonly user: VotingUser,
        public readonly room: VotingRoom,
    ) {}
}
