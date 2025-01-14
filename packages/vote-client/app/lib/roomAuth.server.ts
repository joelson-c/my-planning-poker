import type { RoomJoinShema } from './roomFormSchema';
import { data } from 'react-router';
import { ClientResponseError } from 'pocketbase';
import { authWithRoomAndUserId, type Backend } from 'server/backend';
import { commitSession, type AppSession } from './session.server';

export async function createVoteUser(
    backend: Backend,
    joinData: RoomJoinShema,
) {
    const { record } = await authWithRoomAndUserId(backend, joinData);
    return record;
}

export async function handleAuthError(error: unknown, session: AppSession) {
    if (error instanceof ClientResponseError) {
        console.error(error);

        session.flash(
            'error',
            'The room does not exist, is closed, or is full.',
        );
    }

    const shouldNotThrow = error instanceof ClientResponseError;

    if (!shouldNotThrow) {
        throw error;
    }

    return data(null, {
        headers: {
            'Set-Cookie': await commitSession(session),
        },
    });
}
