import type { Route } from './+types';
import { redirect } from 'react-router';
import { LoginCard } from './card';
import { roomJoinForm } from './roomJoinForm';
import { commitSession, getSession } from '~/lib/session.server';
import type { User } from '~/types/user';
import { formDataToObject } from '~/lib/utils';
import type { Room } from '~/types/room';

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const roomId = url.searchParams.get('roomId');

    return {
        roomId,
    };
}

function getRandomPassword() {
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    return Buffer.from(randomBytes).toString('base64');
}

export async function action({ request, context }: Route.ActionArgs) {
    const { backend } = context;
    const inputData = formDataToObject(await request.formData());
    const joinData = roomJoinForm.parse(inputData);
    const session = await getSession(request.headers.get('Cookie'));

    let user: User | undefined;
    const prevPassword = session.get('prevPassword');
    const prevNickname = session.get('prevNickname');
    if (prevNickname && prevPassword) {
        try {
            const { record: prevUser } = await backend
                .collection('vote_users')
                .authWithPassword(prevNickname, prevPassword);

            const updatedPrevUser = await backend
                .collection('vote_users')
                .update(prevUser.id, {
                    nickname: joinData.nickname,
                    observer: joinData.isObserver,
                });

            user = updatedPrevUser;
        } catch (error) {
            console.warn('Failed to recycle previous user', error);
        }
    }

    if (!user) {
        const randomPassword = getRandomPassword();
        const shouldBeAdmin = joinData.roomId;

        user = await backend.collection('vote_users').create({
            nickname: joinData.nickname,
            observer: joinData.isObserver,
            password: randomPassword,
            passwordConfirm: randomPassword,
            admin: shouldBeAdmin,
        });

        session.set('prevPassword', randomPassword);
    }

    session.set('prevNickname', user!.nickname);

    let room: Room;
    if (joinData.roomId) {
        const existentRoom = await backend
            .collection('vote_rooms')
            .getOne(joinData.roomId);

        if (existentRoom.closed) {
            throw new Error('Room is closed');
        }

        await backend.collection('vote_rooms').update(joinData.roomId, {
            'users+': [user!.id],
        });

        room = existentRoom;
    } else {
        const createdRoom = await backend.collection('vote_rooms').create({
            cardType: ['FIBONACCI'],
            state: ['VOTING'],
            users: [user!.id],
        });

        room = createdRoom;
    }

    return redirect(`/room/${room.id}`, {
        headers: {
            'Set-Cookie': await commitSession(session),
        },
    });
}

export default function RoomEntryIndex({ loaderData }: Route.ComponentProps) {
    const { roomId } = loaderData;

    return (
        <main>
            <LoginCard roomId={roomId || undefined} />
        </main>
    );
}
