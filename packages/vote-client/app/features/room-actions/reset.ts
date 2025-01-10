import type { RecordAuthResponse } from 'pocketbase';
import type { Route } from './+types/reveal';
import type { Room } from '~/types/room';
import { getCurrentUser } from '~/lib/user.server';
import { UnauthorizedError } from '~/lib/errors/UnauthorizedError';

export async function action({
    context,
    params: { roomId },
}: Route.ActionArgs) {
    const { backend } = context;
    const currentUser = await getCurrentUser(backend);
    if (!currentUser) {
        throw new UnauthorizedError();
    }

    await backend.send<RecordAuthResponse<Room>>(
        `/api/vote/collections/voteRooms/reset/${roomId}`,
        {
            method: 'POST',
        },
    );

    return new Response(null, {
        status: 201,
    });
}
