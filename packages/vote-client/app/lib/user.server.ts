import { ClientResponseError } from 'pocketbase';
import type { Backend } from 'server/backend';

export async function getCurrentUser(backend: Backend) {
    if (
        !backend.authStore.isValid ||
        backend.authStore.record?.collectionName !== 'vote_users'
    ) {
        return null;
    }

    let currentUser;
    try {
        currentUser = await backend
            .collection('vote_users')
            .getOne(backend.authStore.record.id);
    } catch (error) {
        if (!(error instanceof ClientResponseError)) {
            throw error;
        }

        return null;
    }

    return currentUser;
}
