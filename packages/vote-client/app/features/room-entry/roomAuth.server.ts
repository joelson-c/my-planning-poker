import type { AppLoadContext } from 'react-router';
import type { RoomJoinForm } from './roomJoinForm';
import type { AppSession } from '~/lib/session.server';

function getRandomPassword() {
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    return Buffer.from(randomBytes).toString('base64');
}

export async function getOrCreateVoteUser(
    context: AppLoadContext,
    joinData: RoomJoinForm,
    session: AppSession,
    userShouldBeAdmin: boolean = false,
) {
    const { backend } = context;

    let user;
    const prevPassword = session.get('prevPassword');
    const prevNickname = session.get('prevNickname');
    const canRecycleUser = prevNickname && prevPassword;

    if (canRecycleUser) {
        try {
            const { record: prevUser } = await backend
                .collection('vote_users')
                .authWithPassword(prevNickname, prevPassword);

            const updatedPrevUser = await backend
                .collection('vote_users')
                .update(prevUser.id, {
                    nickname: joinData.nickname,
                    observer: joinData.isObserver,
                    vote: null,
                });

            user = updatedPrevUser;
        } catch (error) {
            console.warn('Failed to recycle previous user', error);
        }
    }

    if (user) {
        session.set('prevNickname', user.nickname);
        return user;
    }

    const randomPassword = getRandomPassword();
    user = await backend.collection('vote_users').create({
        nickname: joinData.nickname,
        observer: joinData.isObserver,
        password: randomPassword,
        passwordConfirm: randomPassword,
        admin: userShouldBeAdmin,
    });

    await backend
        .collection('vote_users')
        .authWithPassword(user.nickname, randomPassword);

    session.set('prevNickname', user.nickname);
    session.set('prevPassword', randomPassword);
    return user;
}
