import {
    USER_KICKED_CLOSE_CODE,
    type InboundMessage,
    type OutboundMessage,
} from '../../types/messages';
import type { RealtimeUser } from '~/types/user';
import { useEffect, useReducer, useTransition } from 'react';
import { RoomState } from '~/types/room';
import { UserKickedError } from '../errors/UserKickedError';
import { useSocket } from './useSocket';

export interface RealtimeState {
    users: RealtimeUser[];
    roomState: RoomState;
}

export type OutboundDispatcher = (message: OutboundMessage) => void;

function inboundReducer(state: RealtimeState, action: InboundMessage) {
    switch (action.name) {
        case 'WS_USER_CONNECTED':
            if (state.users.find((user) => user.id === action.data.id)) {
                return state;
            }

            return {
                ...state,
                users: [
                    ...state.users,
                    {
                        ...action.data,
                        hasVoted: false,
                    },
                ],
            };

        case 'WS_USER_UPDATED':
            return {
                ...state,
                users: state.users.map((user) => {
                    if (user.id === action.data.id) {
                        return action.data;
                    }

                    return user;
                }),
            };

        case 'WS_USER_DISCONNECTED':
            return {
                ...state,
                users: state.users.filter((user) => user.id !== action.data.id),
            };

        case 'WS_REVEAL':
            return {
                ...state,
                roomState: RoomState.REVEAL,
            };

        case 'WS_RESET':
            return {
                ...state,
                roomState: RoomState.VOTING,
            };

        default:
            return state;
    }
}

function initializeState(initialUsers?: RealtimeUser[]) {
    return {
        users: initialUsers || [],
        roomState: RoomState.VOTING,
    } satisfies RealtimeState;
}

export function useRealtimeState(initialUsers?: RealtimeUser[]) {
    const { message, open, closeCode, sendMessage } = useSocket();

    const [state, inboundDispatch] = useReducer(
        inboundReducer,
        initialUsers,
        initializeState,
    );

    const [, startTransition] = useTransition();

    useEffect(() => {
        if (!message) {
            return;
        }

        inboundDispatch(message);
    }, [message]);

    useEffect(() => {
        if (!closeCode) {
            return;
        }

        if (closeCode === USER_KICKED_CLOSE_CODE) {
            startTransition(() => {
                throw new UserKickedError();
            });
        }
    }, [closeCode]);

    function outboundDispatcher(message: OutboundMessage) {
        sendMessage(message);
    }

    return {
        ...state,
        pending: !open,
        outboundDispatcher,
    };
}
