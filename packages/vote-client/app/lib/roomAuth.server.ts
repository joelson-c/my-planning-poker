import type { RoomJoinForm } from './roomJoinForm';
import type { AppSession } from '~/lib/session.server';
import { authWithRoomAndNickname, type Backend } from 'server/backend';

function getRandomPassword() {
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    return Buffer.from(randomBytes).toString('base64');
}

async function createNewUser(
    backend: Backend,
    session: AppSession,
    { nickname, isObserver }: RoomJoinForm,
    roomId: string,
    isRoomOwner: boolean = false,
) {
    const lastCreatedUserId = session.get('lastCreatedUserId');
    // Cleanup old connections
    if (lastCreatedUserId && backend.authStore.isValid) {
        try {
            await backend.collection('vote_users').delete(lastCreatedUserId);
        } catch (error) {
            console.log('Failed to delete last created user: %s', error);
        }
    }

    const randomPassword = getRandomPassword();
    const user = await backend.collection('vote_users').create({
        nickname: nickname,
        observer: isObserver,
        password: randomPassword,
        passwordConfirm: randomPassword,
        owner: isRoomOwner,
        room: roomId,
    });

    await authWithRoomAndNickname(backend, roomId, nickname, randomPassword);
    session.set('lastNickname', user.nickname);
    session.set('lastCreatedUserId', user.id);
    return user;
}

export async function createVoteUser(
    backend: Backend,
    joinData: RoomJoinForm,
    session: AppSession,
    roomId: string,
    isRoomOwner: boolean = false,
) {
    return createNewUser(backend, session, joinData, roomId, isRoomOwner);
}
