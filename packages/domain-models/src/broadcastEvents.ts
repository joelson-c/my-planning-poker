import type { VotingUser } from '@prisma/client';

type EventType = 'ROOM_RESET' | 'VOTE_REVEAL' | 'NEW_ADMIN';

export interface BroadcastEvent {
    type: EventType;
}

export interface RoomResetEvent extends BroadcastEvent {
    type: 'ROOM_RESET';
}

export interface VoteRevealEvent extends BroadcastEvent {
    type: 'VOTE_REVEAL';
    votes: VotingUser['vote'][];
}

export interface NewAdminEvent extends BroadcastEvent {
    type: 'NEW_ADMIN';
    newAdminId: VotingUser['id'];
}

export type BroadcastEvents = RoomResetEvent | VoteRevealEvent | NewAdminEvent;
