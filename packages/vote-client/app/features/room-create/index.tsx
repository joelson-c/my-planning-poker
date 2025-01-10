import type { Route } from './+types';
import { data, redirect } from 'react-router';
import { LoginCard } from '../../components/room-login/LoginCard';
import { roomJoinForm } from '../../lib/roomJoinForm';
import { commitSession, getSession } from '~/lib/session.server';
import { formDataToObject } from '~/lib/utils';
import { createVoteUser, handleAuthError } from '../../lib/roomAuth.server';
import { LoginForm } from '../../components/room-login/LoginForm';
import { useSessionErrorToast } from '~/lib/useSessionErrorToast';

export function meta() {
    return [{ title: 'My Planning Poker' }];
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

export async function action({ request, context }: Route.ActionArgs) {
    const { backend } = context;
    const inputData = formDataToObject(await request.formData());
    const joinData = roomJoinForm.parse(inputData);
    const session = await getSession(request.headers.get('Cookie'));

    const room = await backend.collection('voteRooms').create({
        cardType: ['FIBONACCI'],
        state: ['VOTING'],
    });

    session.set('lastNickname', joinData.nickname);

    try {
        await createVoteUser(backend, joinData, room.id, true);
    } catch (error) {
        return await handleAuthError(error, session);
    }

    return redirect(`/room/${room.id}`, {
        headers: {
            'Set-Cookie': await commitSession(session),
        },
    });
}

export default function RoomCreate({
    loaderData: { sessionError, prevNickname },
    actionData,
}: Route.ComponentProps) {
    const { nicknameTaken } = actionData || {};
    useSessionErrorToast(sessionError);

    return (
        <main>
            <LoginCard>
                <LoginForm
                    nicknameTaken={nicknameTaken}
                    prevNickname={prevNickname}
                />
            </LoginCard>
        </main>
    );
}
