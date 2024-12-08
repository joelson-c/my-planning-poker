import type { ActionFunctionArgs } from '@remix-run/node';
import { validateAndGetToken } from '~/lib/api/auth.server';
import { revealCards } from '~/lib/api/room';

export async function action({ request, params }: ActionFunctionArgs) {
    const { roomId } = params;
    if (!roomId) {
        throw new Response(null, { status: 404 });
    }

    const { rawToken } = await validateAndGetToken(request);
    await revealCards(rawToken, roomId);
    return null;
}
