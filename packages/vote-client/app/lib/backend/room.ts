import type { User } from '~/types/user';
import { backendClient } from './client';
import { normalizeBackendError } from '../utils';

export async function getRoomUsers(currentUser: User) {
    let users;
    try {
        users = await backendClient.collection('voteUsers').getFullList({
            skipTotal: true,
            filter: backendClient.filter('room={:roomId}', {
                roomId: currentUser.room,
            }),
        });
    } catch (error) {
        normalizeBackendError(error);
    }

    return users;
}
