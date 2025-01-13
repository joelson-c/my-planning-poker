import type { Route } from './+types';
import { data, Link, redirect } from 'react-router';
import { LoginCard } from '~/components/room-login/LoginCard';
import { roomJoinSchema } from '~/lib/roomFormSchema';
import { commitSession, getSession } from '~/lib/session.server';
import { formDataToObject } from '~/lib/utils';
import { createVoteUser, handleAuthError } from '~/lib/roomAuth.server';
import { LoginForm } from '~/components/room-login/LoginForm';
import { useSessionErrorToast } from '~/lib/useSessionErrorToast';
import { Button } from '~/components/ui/button';

export function meta() {
    return [{ title: 'Join Planning Poker Room' }];
}

export async function loader({
    request,
    params: { roomId },
}: Route.LoaderArgs) {
    const session = await getSession(request.headers.get('Cookie'));
    const sessionError = session.get('error');
    const prevNickname = session.get('lastNickname');

    return data(
        {
            sessionError,
            prevNickname,
            roomId,
        },
        {
            headers: {
                'Set-Cookie': await commitSession(session),
            },
        },
    );
}

export async function action({
    request,
    context: { backend },
}: Route.ActionArgs) {
    const inputData = formDataToObject(await request.formData());
    const session = await getSession(request.headers.get('Cookie'));

    const joinData = roomJoinSchema.parse(inputData);

    let user;
    try {
        user = await createVoteUser(backend, joinData);
    } catch (error) {
        return await handleAuthError(error, session);
    }

    return redirect(`/room/${user.room}`, {
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
        <LoginCard title="Join a Room">
            <div className="flex flex-col gap-4">
                <LoginForm
                    roomId={roomId}
                    prevNickname={prevNickname}
                    nicknameTaken={nicknameTaken}
                    schema={roomJoinSchema}
                />
                <Button variant="link" asChild>
                    <Link to="/">Create a new room</Link>
                </Button>
            </div>
        </LoginCard>
    );
}
