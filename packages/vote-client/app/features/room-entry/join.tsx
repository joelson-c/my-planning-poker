import type { Route } from './+types/join';
import { data, redirect } from 'react-router';
import { LoginCard } from './card';
import { roomJoinForm } from './roomJoinForm';
import { commitSession, getSession } from '~/lib/session.server';
import { formDataToObject } from '~/lib/utils';
import { getOrCreateVoteUser } from './roomAuth.server';
import { ClientResponseError } from 'pocketbase';
import { LoginForm } from './form';
import { useSessionErrorToast } from '~/lib/useSessionErrorToast';

export function meta() {
    return [{ title: 'Join Planning Poker Room' }];
}

export async function loader({ request }: Route.LoaderArgs) {
    const session = await getSession(request.headers.get('Cookie'));
    const sessionError = session.get('error');
    const prevNickname = session.get('prevNickname');

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
            .collection('vote_rooms')
            .getFirstListItem(backend.filter('id={:roomId}', { roomId }));
    } catch (error) {
        if (!(error instanceof ClientResponseError)) {
            throw error;
        }

        session.flash(
            'error',
            'The room does not exist, is closed, or is full.',
        );

        return redirect('/', {
            headers: {
                'Set-Cookie': await commitSession(session),
            },
        });
    }

    const joinData = roomJoinForm.parse(inputData);
    let user;
    try {
        user = await getOrCreateVoteUser(context, joinData, session);
    } catch (error) {
        if (!(error instanceof ClientResponseError)) {
            throw error;
        }

        const isNicknameTaken =
            typeof error.response.data?.nickname === 'object';

        if (!isNicknameTaken) {
            session.flash(
                'error',
                'An error occurred while creating the user.',
            );
        }

        return data(
            {
                nicknameTaken: isNicknameTaken,
            },
            {
                headers: {
                    'Set-Cookie': await commitSession(session),
                },
            },
        );
    }

    await backend.collection('vote_rooms').update(room.id, {
        'users+': [user.id],
    });

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
