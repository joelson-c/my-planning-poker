import type { Route } from './+types/reveal';
import { getCurrentUser } from '~/lib/user.server';
import { UnauthorizedError } from '~/lib/errors/UnauthorizedError';

export async function action({ context }: Route.ActionArgs) {
    const { backend } = context;
    const currentUser = await getCurrentUser(backend);
    if (!currentUser) {
        throw new UnauthorizedError();
    }

    await backend.collection('vote_rooms').update(currentUser.room, {
        state: 'VOTING',
    });

    return new Response(null, {
        status: 201,
    });
}
