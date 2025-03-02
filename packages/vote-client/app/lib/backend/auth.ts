import type { RecordAuthResponse } from 'pocketbase';
import type { RoomJoinShema } from '../roomFormSchema';
import type { UserRecord } from '~/types/user';
import { backendClient } from './client';
import { UnauthorizedError } from '~/lib/errors/UnauthorizedError';

export async function authWithRoomAndUserId(joinData: RoomJoinShema) {
    const authResponse = await backendClient.send<
        RecordAuthResponse<UserRecord>
    >('/api/collections/voteRooms/room-auth', {
        method: 'POST',
        body: {
            room: joinData.roomId,
            nickname: joinData.nickname,
            isObserver: joinData.isObserver,
        },
    });

    backendClient.authStore.save(authResponse.token, authResponse.record);
    return authResponse;
}

export async function getCurrentUser() {
    if (!backendClient.authStore.isValid) {
        throw new UnauthorizedError();
    }

    let currentUserAuth;
    try {
        currentUserAuth = await backendClient
            .collection('voteUsers')
            .authRefresh();
    } catch {
        backendClient.authStore.clear();
        throw new UnauthorizedError();
    }

    return currentUserAuth.record;
}
