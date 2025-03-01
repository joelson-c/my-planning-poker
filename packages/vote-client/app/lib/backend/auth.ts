import type { RecordAuthResponse } from 'pocketbase';
import type { RoomJoinShema } from '../roomFormSchema';
import type { User } from '~/types/user';
import { backendClient } from './client';
import { UnauthorizedError } from '~/lib/errors/UnauthorizedError';

export async function authWithRoomAndUserId(joinData: RoomJoinShema) {
    const authResponse = await backendClient.send<RecordAuthResponse<User>>(
        '/api/vote/collections/voteRooms/room-auth',
        {
            method: 'POST',
            body: {
                room: joinData.roomId,
                nickname: joinData.nickname,
                isObserver: joinData.isObserver,
            },
        },
    );

    backendClient.authStore.save(authResponse.token, authResponse.record);
    return authResponse;
}

export function getCurrentUserOrThrow() {
    const currentUser = backendClient.authStore.record;
    if (!currentUser) {
        throw new UnauthorizedError();
    }

    return currentUser;
}
