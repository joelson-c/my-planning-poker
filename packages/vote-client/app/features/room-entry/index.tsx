import type { Route } from './+types';
import { data, redirect } from 'react-router';
import { LoginCard } from './card';
import { roomJoinForm } from './roomJoinForm';
import { commitSession, getSession } from '~/lib/session.server';
import { formDataToObject } from '~/lib/utils';
import { createVoteUser } from './roomAuth.server';
import { LoginForm } from './form';
import { ClientResponseError } from 'pocketbase';
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

    const room = await backend.collection('vote_rooms').create({
        cardType: ['FIBONACCI'],
        state: ['VOTING'],
    });

    try {
        await createVoteUser(backend, joinData, session, room.id, true);
    } catch (error) {
        if (!(error instanceof ClientResponseError)) {
            throw error;
        }

        const isNicknameTaken =
            typeof error.response.data?.nickname === 'object';

        if (!isNicknameTaken) {
            console.error(error);

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

    return redirect(`/room/${room.id}`, {
        headers: {
            'Set-Cookie': await commitSession(session),
        },
    });
}

export default function RoomEntryIndex({
    loaderData,
    actionData,
}: Route.ComponentProps) {
    const { sessionError } = loaderData;
    const { nicknameTaken } = actionData || {};
    useSessionErrorToast(sessionError);

    return (
        <main>
            <LoginCard>
                <LoginForm nicknameTaken={nicknameTaken} />
            </LoginCard>
        </main>
    );
}
