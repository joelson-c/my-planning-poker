import type { RoomJoinShema } from './roomFormSchema';
import { data } from 'react-router';
import { ClientResponseError } from 'pocketbase';
import { authWithRoomAndUserId, type Backend } from 'server/backend';
import { NicknameTakenError } from './errors/NicknameTakenError';
import { commitSession, type AppSession } from './session.server';

export async function createVoteUser(
    backend: Backend,
    joinData: RoomJoinShema,
) {
    let user;
    try {
        user = await authWithRoomAndUserId(backend, joinData);
    } catch (error) {
        if (!(error instanceof ClientResponseError)) {
            throw error;
        }

        const isNicknameTaken =
            typeof error.response.data?.nickname === 'object';

        if (isNicknameTaken) {
            throw new NicknameTakenError();
        }

        throw error;
    }

    return user.record;
}

export async function handleAuthError(error: unknown, session: AppSession) {
    if (error instanceof ClientResponseError) {
        console.error(error);

        session.flash(
            'error',
            'The room does not exist, is closed, or is full.',
        );
    }

    const shouldNotThrow =
        error instanceof ClientResponseError ||
        error instanceof NicknameTakenError;

    if (!shouldNotThrow) {
        throw error;
    }

    return data(
        {
            nicknameTaken: error instanceof NicknameTakenError,
        },
        {
            headers: {
                'Set-Cookie': await commitSession(session),
            },
        },
    );
}
