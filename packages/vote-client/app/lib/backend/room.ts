import { backendClient } from './client';
import { normalizeBackendError } from '../utils';

export async function getRoomUsers(roomId: string) {
    let users;
    try {
        users = await backendClient.collection('voteUsers').getFullList({
            skipTotal: true,
            filter: backendClient.filter('room={:roomId}', {
                roomId,
            }),
        });
    } catch (error) {
        normalizeBackendError(error);
    }

    return users;
}
