import { getAuthenticatedHttpClient, httpClient } from '../http.server';
import type { VotingRoom } from '@planningpoker/domain-models';

export async function createRoom(token: string) {
    const httpClient = getAuthenticatedHttpClient(token);
    const {
        data: { room },
    } = await httpClient.post<{ room: VotingRoom }>('room/create');
    return room;
}

export async function joinRoom(
    token: string,
    roomId: string,
    isObserver = false,
) {
    const httpClient = getAuthenticatedHttpClient(token);

    const { data } = await httpClient.post<{ room: VotingRoom } | null>(
        `room/${roomId}/join`,
        {
            isObserver,
        },
    );

    return data?.room || null;
}

export async function leaveRoom(token: string, roomId: string) {
    const httpClient = getAuthenticatedHttpClient(token);
    await httpClient.post(`room/${roomId}/leave`);
}

export async function roomExists(roomId: string) {
    const { data } = await httpClient.get<boolean>(`room/${roomId}/exists`);
    return data;
}

export async function getMyJoinedRoom(token: string) {
    const httpClient = getAuthenticatedHttpClient(token);

    const { data } = await httpClient.get<{ room: VotingRoom } | null>(
        `room/mine`,
    );

    return data?.room || null;
}

export async function revealCards(token: string, roomId: string) {
    const httpClient = getAuthenticatedHttpClient(token);

    const { data } = await httpClient.post<{ room: VotingRoom } | null>(
        `room/${roomId}/reveal`,
    );

    return data?.room || null;
}

export async function resetRoom(token: string, roomId: string) {
    const httpClient = getAuthenticatedHttpClient(token);

    const { data } = await httpClient.post<{ room: VotingRoom } | null>(
        `room/${roomId}/reset`,
    );

    return data?.room || null;
}
