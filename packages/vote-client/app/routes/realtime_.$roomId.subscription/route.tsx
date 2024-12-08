import { json, type ActionFunctionArgs } from '@remix-run/node';
import { refreshToken } from '~/lib/api/auth.server';
import { getSubscriptionToken } from '~/lib/api/realtime';
import { commitSession } from '~/lib/session';

export async function action({ params, request }: ActionFunctionArgs) {
    const { roomId } = params;
    if (!roomId) {
        throw new Response(null, { status: 404 });
    }

    const { token, session } = await refreshToken(request);
    const connectionToken = await getSubscriptionToken(token, roomId);

    return json(
        { token: connectionToken },
        {
            headers: {
                'Set-Cookie': await commitSession(session),
            },
        },
    );
}
