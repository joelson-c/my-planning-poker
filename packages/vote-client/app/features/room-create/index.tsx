import type { Route } from './+types';
import { data, Link, redirect } from 'react-router';
import { LoginCard } from '../../components/room-login/LoginCard';
import { roomCreateSchema } from '../../lib/roomFormSchema';
import { commitSession, getSession } from '~/lib/session.server';
import { formDataToObject } from '~/lib/utils';
import { createVoteUser, handleAuthError } from '../../lib/roomAuth.server';
import { LoginForm } from '../../components/room-login/LoginForm';
import { useSessionErrorToast } from '~/lib/useSessionErrorToast';
import { Button } from '~/components/ui/button';

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
    const joinData = roomCreateSchema.parse(inputData);
    const session = await getSession(request.headers.get('Cookie'));

    const room = await backend.collection('voteRooms').create({
        cardType: ['FIBONACCI'],
        state: ['VOTING'],
    });

    session.set('lastNickname', joinData.nickname);

    let user;
    try {
        user = await createVoteUser(backend, {
            ...joinData,
            roomId: room.id,
        });
    } catch (error) {
        return await handleAuthError(error, session);
    }

    return redirect(`/room/${user.room}`, {
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
        <LoginCard title="Create a Room">
            <div className="flex flex-col gap-4">
                <LoginForm
                    nicknameTaken={nicknameTaken}
                    prevNickname={prevNickname}
                    schema={roomCreateSchema}
                />
                <Button variant="link" asChild>
                    <Link to="/join">Join a Room</Link>
                </Button>
            </div>
        </LoginCard>
    );
}
