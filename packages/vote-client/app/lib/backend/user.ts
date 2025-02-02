import type { RecordOptions } from 'pocketbase';
import { redirect } from 'react-router';
import { isClientResponseError, normalizeBackendError } from '../utils';
import { getCurrentUserOrThrow } from './auth';
import { backendClient } from './client';
import { UnauthorizedError } from '../errors/UnauthorizedError';

export async function getCurrentUserRoom(
    roomId: string,
    options?: RecordOptions,
) {
    try {
        // Check if the user is valid
        getCurrentUserOrThrow();
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            throw redirect(`/join/${roomId}`);
        }

        throw error;
    }

    let room;
    try {
        room = await backendClient
            .collection('voteRooms')
            .getOne(roomId, options);
    } catch (error) {
        if (isClientResponseError(error)) {
            if (error.status === 404) {
                throw redirect(`/join/${roomId}`);
            }
        }

        normalizeBackendError(error);
    }

    return room;
}
