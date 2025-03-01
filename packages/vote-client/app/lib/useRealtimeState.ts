import { useMemo, useReducer } from 'react';
import useWebSocket from 'react-use-websocket';
import { backendClient } from './backend/client';
import type { User } from '~/types/user';

export interface RealtimeState {
    users: User[];
}

type AddUserAction = {
    type: 'ADD_USER';
    user: User;
};

type Actions = AddUserAction;

function reducer(state: RealtimeState, action: Actions) {
    return state;
}

const initialState = {
    users: [],
} satisfies RealtimeState;

export function useRealtimeState(roomId: string) {
    const socketUrl = useMemo(() => {
        const url = new URL(backendClient.buildURL(`/api/ws/room/${roomId}`));
        url.protocol = 'wss:';
        url.searchParams.set('token', backendClient.authStore.token);
        return url.toString();
    }, [roomId]);

    const [state, dispatch] = useReducer(reducer, initialState);
    const { readyState } = useWebSocket(socketUrl, {
        reconnectAttempts: 10,
        reconnectInterval: (attemptNumber) =>
            Math.min(Math.pow(2, attemptNumber) * 1000, 10000),
    });

    console.log(readyState);
    return state;
}
