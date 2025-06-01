import type {
    Presence,
    RoomResult,
    RoomStatus,
} from '../realtimeWorker/messages';

type RoomState = {
    isConnected: boolean;
    error?: unknown;
    presence: Presence[];
    vote?: string;
    status: RoomStatus;
    result?: RoomResult;
};

type ClientConnectionAction = {
    type: 'client_connection';
    isConnected: boolean;
};

type ErrorAction = {
    type: 'error';
    error: unknown;
};

type SyncPresence = {
    type: 'sync_presence';
    presence: Presence[];
};

type Vote = {
    type: 'vote';
    value?: string;
};

type SetStatus = {
    type: 'set_status';
    status: RoomStatus;
};

type SetResult = {
    type: 'set_result';
    result?: RoomResult;
};

type RoomAction =
    | ClientConnectionAction
    | ErrorAction
    | SyncPresence
    | Vote
    | SetStatus
    | SetResult;

export function reducer(state: RoomState, action: RoomAction): RoomState {
    switch (action.type) {
        case 'client_connection':
            return {
                ...state,
                isConnected: action.isConnected,
            };
        case 'error':
            return {
                ...state,
                error: action.error,
            };
        case 'sync_presence':
            return {
                ...state,
                presence: action.presence,
            };
        case 'vote':
            return {
                ...state,
                vote: action.value,
            };
        case 'set_status':
            return {
                ...state,
                status: action.status,
            };
        case 'set_result':
            return {
                ...state,
                result: action.result,
            };
        default:
            return state;
    }
}
