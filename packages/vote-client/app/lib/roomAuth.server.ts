import { ClientResponseError } from 'pocketbase';
import type { RoomJoinForm } from './roomJoinForm';
import { authWithRoomAndNickname, type Backend } from 'server/backend';
import { NicknameTakenError } from './errors/NicknameTakenError';
import { commitSession, type AppSession } from './session.server';
import { data } from 'react-router';

function getRandomPassword() {
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    return Buffer.from(randomBytes).toString('base64');
}

export async function createVoteUser(
    backend: Backend,
    { nickname, isObserver }: RoomJoinForm,
    roomId: string,
    isRoomOwner: boolean = false,
) {
    const randomPassword = getRandomPassword();

    let user;
    try {
        user = await backend.collection('voteUsers').create({
            nickname: nickname,
            observer: isObserver,
            password: randomPassword,
            passwordConfirm: randomPassword,
            owner: isRoomOwner,
            room: roomId,
        });
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

    await authWithRoomAndNickname(backend, roomId, nickname, randomPassword);
    return user;
}

export async function handleAuthError(error: unknown, session: AppSession) {
    if (error instanceof ClientResponseError) {
        console.error(error);

        session.flash('error', 'An error occurred while creating the user.');
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
