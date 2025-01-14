import type { Backend } from 'server/backend';
import { ClientResponseError } from 'pocketbase';

export async function getCurrentUser(backend: Backend) {
    if (
        !backend.authStore.isValid ||
        backend.authStore.record?.collectionName !== 'voteUsers'
    ) {
        return null;
    }

    let currentUser;
    try {
        currentUser = await backend
            .collection('voteUsers')
            .getOne(backend.authStore.record.id);
    } catch (error) {
        if (!(error instanceof ClientResponseError)) {
            throw error;
        }

        return null;
    }

    return currentUser;
}
