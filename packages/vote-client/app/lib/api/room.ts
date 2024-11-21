import { getAuthenticatedHttpClient, httpClient } from '../http.server';
import type { VotingRoom } from '@planningpoker/domain-models';

export async function createRoom(token: string) {
    const httpClient = getAuthenticatedHttpClient(token);
    const {
        data: { room },
    } = await httpClient.post<{ room: VotingRoom }>('room/create');
    return room;
}

export async function roomExists(roomId: string) {
    const { data } = await httpClient.post<boolean>(`room/${roomId}/exists`);
    return data;
}
