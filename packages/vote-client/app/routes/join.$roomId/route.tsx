import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect, useParams } from '@remix-run/react';
import { create } from 'superstruct';
import { LoginCard } from '~/components/login/card';
import { authenticate } from '~/lib/api/auth.server';
import { joinData } from '~/lib/api/join-data';
import { joinRoom, roomExists } from '~/lib/api/room';
import { commitSession } from '~/lib/session';

type RouteParams = {
    roomId: string;
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
    if (!params.roomId) {
        throw new Response(null, { status: 400 });
    }

    if (!(await roomExists(params.roomId))) {
        throw new Response(null, { status: 404 });
    }

    return null;
};

export default function Join() {
    const { roomId } = useParams<RouteParams>();

    return (
        <main>
            <LoginCard roomId={roomId} />
        </main>
    );
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
    if (!params.roomId) {
        throw new Response(null, { status: 403 });
    }

    const body = await request.formData();
    const { nickname, isObserver, roomId } = create(
        {
            nickname: body.get('nickname'),
            isObserver: body.get('isObserver') === 'on',
            roomId: params.roomId,
        },
        joinData,
    );

    const { session: autheticatedSession, token } = await authenticate(
        request,
        {
            nickname,
        },
    );

    await joinRoom(token, roomId, isObserver);

    return redirect(`/room/${roomId}/vote`, {
        headers: {
            'Set-Cookie': await commitSession(autheticatedSession),
        },
    });
};
