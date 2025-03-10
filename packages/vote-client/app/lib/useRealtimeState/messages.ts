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
        target: string;
    };
};

type RevealMessage = {
    name: 'WS_REVEAL';
};

type ResetMessage = {
    name: 'WS_RESET';
};

export type BidirecionalMessage =
    | RevealMessage
    | ResetMessage
    | KickUserMessage;

export type InboundMessage =
    | UserConnectedMessage
    | UserDisconnectedMessage
    | UserUpdatedMessage
    | BidirecionalMessage;

export type OutboundMessage = BidirecionalMessage;

export const USER_KICKED_CLOSE_CODE = 4000;
