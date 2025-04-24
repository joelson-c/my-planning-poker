import type { JoinSchema } from '~/components/room-login/schema';

export type RoomStatus = 'voting' | 'reveal';

export type InitMessage = {
    type: 'init';
    payload: JoinSchema;
};

export type ConnectedToChannel = {
    type: 'connected';
    status: RoomStatus;
};

export type Error = {
    type: 'error';
    payload?: unknown;
};

export type Disconnect = {
    type: 'disconnect';
};

export type Presence = {
    id: string;
    nickname: string;
    observer: boolean;
    voted: boolean;
    current: boolean;
};

export type PresenceSync = {
    type: 'presence_sync';
    payload: Presence[];
};

export type StateChanged = {
    type: 'state_changed';
    status: RoomStatus;
};

export type IndividualVote = { nickname: string; vote: string };

export type RoomResult = {
    type: 'room_result';
    total: number;
    votes: IndividualVote[];
    distribution: Record<string, number>;
    average: number;
    median: number;
};

export type Vote = {
    type: 'vote';
    payload: string;
};

export type VoteResponse = {
    type: 'vote_response';
    payload?: string;
};

export type ChangeStatus = {
    type: 'change_Status';
    payload: RoomStatus;
};

export type GetResults = {
    type: 'get_results';
};

export type InboundMessage =
    | InitMessage
    | Disconnect
    | GetResults
    | ChangeStatus
    | Vote;

export type OutboundMessage =
    | ConnectedToChannel
    | Error
    | PresenceSync
    | StateChanged
    | RoomResult
    | VoteResponse;
