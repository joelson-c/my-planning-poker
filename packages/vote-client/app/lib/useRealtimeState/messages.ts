import type { RealtimeUser } from '~/types/user';

type UserConnectedMessage = {
    name: 'WS_USER_CONNECTED';
    data: Pick<RealtimeUser, 'id' | 'nickname' | 'observer'>;
};

type UserDisconnectedMessage = {
    name: 'WS_USER_DISCONNECTED';
    data: Pick<RealtimeUser, 'id' | 'nickname' | 'observer'>;
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

type GenericErrorMessage = {
    name: 'WS_ERROR';
};

export type BidirecionalMessage =
    | RevealMessage
    | ResetMessage
    | KickUserMessage;

export type InboundMessage =
    | UserConnectedMessage
    | UserDisconnectedMessage
    | UserUpdatedMessage
    | BidirecionalMessage
    | GenericErrorMessage;

export type OutboundMessage = BidirecionalMessage;

export const USER_KICKED_CLOSE_CODE = 4000;
