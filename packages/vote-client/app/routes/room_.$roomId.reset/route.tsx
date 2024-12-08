import { redirect, type ActionFunctionArgs } from '@remix-run/node';
import { validateAndGetToken } from '~/lib/api/auth.server';
import { resetRoom } from '~/lib/api/room';

export async function action({ request, params }: ActionFunctionArgs) {
    const { roomId } = params;
    if (!roomId) {
        throw new Response(null, { status: 404 });
    }

    const { rawToken } = await validateAndGetToken(request);
    await resetRoom(rawToken, roomId);
    return redirect(`/room/${roomId}`);
}
