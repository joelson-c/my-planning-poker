import {
    USER_KICKED_CLOSE_CODE,
    type InboundMessage,
    type OutboundMessage,
} from './messages';
import type { RealtimeUser } from '~/types/user';
import { useEffect, useMemo, useReducer, useTransition } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { backendClient } from '../backend/client';
import type { RoomState } from '~/types/room';
import { UserDisconnectError } from '../errors/UserDisconnectError';
import { useRealtimeSideEffects } from './useRealtimeSideEffects';

export interface RealtimeState {
    users: RealtimeUser[];
    roomState: RoomState;
}

function reducer(state: RealtimeState, action: InboundMessage) {
    switch (action.name) {
        case 'WS_USER_CONNECTED':
            if (state.users.find((user) => user.id === action.data.id)) {
                return state;
            }

            return {
                ...state,
                users: [...state.users, action.data],
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
        case 'WS_USER_REMOVED':
            return {
                ...state,
                users: state.users.filter((user) => user.id !== action.data.id),
            };

        case 'WS_ROOM_STATE_CHANGED':
            return {
                ...state,
                roomState: action.data.state,
            };

        default:
            return state;
    }
}

function initializeState(initialUsers?: RealtimeUser[]) {
    return {
        users: initialUsers || [],
        roomState: 'VOTING',
    } satisfies RealtimeState;
}

export function useRealtimeState(
    roomId: string,
    initialUsers?: RealtimeUser[],
) {
    const socketUrl = useMemo(() => {
        const url = new URL(backendClient.buildURL(`/api/ws/room/${roomId}`));
        url.protocol = 'wss:';
        url.searchParams.set('token', backendClient.authStore.token);
        return url.toString();
    }, [roomId]);

    const [state, dispatch] = useReducer(
        reducer,
        initialUsers,
        initializeState,
    );
    const [, startTransition] = useTransition();

    const { readyState, lastJsonMessage, sendJsonMessage } =
        useWebSocket<InboundMessage | null>(socketUrl, {
            reconnectAttempts: 10,
            reconnectInterval: (attemptNumber) =>
                Math.min(Math.pow(2, attemptNumber) * 1000, 10000),
            onClose({ code }) {
                if (code === USER_KICKED_CLOSE_CODE) {
                    startTransition(() => {
                        throw new UserDisconnectError();
                    });
                }
            },
        });

    useRealtimeSideEffects(roomId, lastJsonMessage);

    function kickUser(targetUser: string) {
        sendJsonMessage({
            name: 'WS_KICK_USR',
            data: {
                targetUser,
            },
        } satisfies OutboundMessage);
    }

    function revealRoom() {
        sendJsonMessage({
            name: 'WS_REVEAL',
        } satisfies OutboundMessage);
    }

    function resetRoom() {
        sendJsonMessage({
            name: 'WS_RESET',
        } satisfies OutboundMessage);
    }

    useEffect(() => {
        if (!lastJsonMessage) {
            return;
        }

        dispatch(lastJsonMessage);
    }, [lastJsonMessage]);

    return {
        ...state,
        pending: readyState !== ReadyState.OPEN,
        kickUser,
        revealRoom,
        resetRoom,
    };
}
