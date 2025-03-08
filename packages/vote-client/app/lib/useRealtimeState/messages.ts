import type { RoomState } from '~/types/room';
import type { RealtimeUser } from '~/types/user';

type UserConnectedMessage = {
    name: 'WS_USER_CONNECTED';
    data: RealtimeUser;
};

type UserDisconnectedMessage = {
    name: 'WS_USER_DISCONNECTED';
    data: {
        id: string;
    };
};

type UserUpdatedMessage = {
    name: 'WS_USER_UPDATED';
    data: RealtimeUser;
};

type KickUserMessage = {
    name: 'WS_KICK_USR';
    data: {
        targetUser: string;
    };
};

type UserRemovedMessage = {
    name: 'WS_USER_REMOVED';
    data: {
        id: string;
        nickname: string;
    };
};

type RevealMessage = {
    name: 'WS_REVEAL';
};

type ResetMessage = {
    name: 'WS_RESET';
};

type RoomStateChangedMessage = {
    name: 'WS_ROOM_STATE_CHANGED';
    data: {
        state: RoomState;
    };
};

export type InboundMessage =
    | UserConnectedMessage
    | UserDisconnectedMessage
    | RoomStateChangedMessage
    | UserRemovedMessage
    | UserUpdatedMessage;

export type OutboundMessage = KickUserMessage | RevealMessage | ResetMessage;

export const USER_KICKED_CLOSE_CODE = 4000;
