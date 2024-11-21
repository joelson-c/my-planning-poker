import type { MetaFunction, ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/react';
import { create } from 'superstruct';
import { LoginCard } from '~/components/login/card';
import { authenticate } from '~/lib/api/auth.server';
import { authenticationData } from '~/lib/api/authentication-data';
import { createRoom } from '~/lib/api/room';
import { commitSession } from '~/lib/session';

export const meta: MetaFunction = () => {
    return [
        { title: 'New Remix App' },
        { name: 'description', content: 'Welcome to Remix!' },
    ];
};

export default function Index() {
    return (
        <main>
            <LoginCard />
        </main>
    );
}

export async function action({ request }: ActionFunctionArgs) {
    const body = await request.formData();
    const { nickname, isObserver } = create(
        {
            nickname: body.get('nickname'),
            isObserver: body.get('isObserver') === 'on',
        },
        authenticationData,
    );

    const { session: autheticatedSession, token } = await authenticate(
        request,
        {
            nickname,
        },
    );

    const { id: roomId } = await createRoom(token);
    return redirect(`/room/${roomId}/vote?observer=${isObserver}`, {
        headers: {
            'Set-Cookie': await commitSession(autheticatedSession),
        },
    });
}
