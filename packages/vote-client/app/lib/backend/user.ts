import type { RecordOptions } from 'pocketbase';
import { redirect } from 'react-router';
import { isClientResponseError, normalizeBackendError } from '../utils';
import { backendClient } from './client';
import type { User } from '~/types/user';

export async function getCurrentUserRoom(
    currentUser: User,
    options?: RecordOptions,
) {
    let room;
    try {
        room = await backendClient
            .collection('voteRooms')
            .getOne(currentUser.room, options);
    } catch (error) {
        if (isClientResponseError(error)) {
            if (error.status === 404) {
                throw redirect(`/join/${currentUser.room}`);
            }
        }

        normalizeBackendError(error);
    }

    return room;
}
