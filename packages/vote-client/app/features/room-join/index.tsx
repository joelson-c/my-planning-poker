import type { Route } from './+types';
import { data, redirect } from 'react-router';
import { LoginCard } from '../../components/room-login/LoginCard';
import { roomJoinForm } from '../../lib/roomJoinForm';
import { commitSession, getSession } from '~/lib/session.server';
import { formDataToObject } from '~/lib/utils';
import { createVoteUser, handleAuthError } from '../../lib/roomAuth.server';
import { ClientResponseError } from 'pocketbase';
import { LoginForm } from '../../components/room-login/LoginForm';
import { useSessionErrorToast } from '~/lib/useSessionErrorToast';

export function meta() {
    return [{ title: 'Join Planning Poker Room' }];
}

export async function loader({ request }: Route.LoaderArgs) {
    const session = await getSession(request.headers.get('Cookie'));
    const sessionError = session.get('error');
    const prevNickname = session.get('lastNickname');

    return data(
        {
            sessionError,
            prevNickname,
        },
        {
            headers: {
                'Set-Cookie': await commitSession(session),
            },
        },
    );
}

export async function action({ request, params, context }: Route.ActionArgs) {
    const { roomId } = params;
    const { backend } = context;
    const inputData = formDataToObject(await request.formData());
    const session = await getSession(request.headers.get('Cookie'));

    let room;
    try {
        room = await backend
            .collection('voteRooms')
            .getFirstListItem(backend.filter('id={:roomId}', { roomId }));
    } catch (error) {
        if (!(error instanceof ClientResponseError)) {
            throw error;
        }

        session.flash(
            'error',
            'The room does not exist, is closed, or is full.',
        );

        return null;
    }

    const joinData = roomJoinForm.parse(inputData);

    try {
        await createVoteUser(backend, joinData, roomId);
    } catch (error) {
        return await handleAuthError(error, session);
    }

    return redirect(`/room/${room.id}`, {
        headers: {
            'Set-Cookie': await commitSession(session),
        },
    });
}

export default function RoomJoin({
    loaderData,
    actionData,
    params: { roomId },
}: Route.ComponentProps) {
    const { sessionError, prevNickname } = loaderData;
    const { nicknameTaken } = actionData || {};
    useSessionErrorToast(sessionError);

    return (
        <main>
            <LoginCard>
                <LoginForm
                    roomId={roomId}
                    prevNickname={prevNickname}
                    nicknameTaken={nicknameTaken}
                />
            </LoginCard>
        </main>
    );
}
