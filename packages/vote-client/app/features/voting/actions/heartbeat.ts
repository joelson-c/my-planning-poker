import type { Route } from './+types/heartbeat';
import { UnauthorizedError } from '~/lib/errors/UnauthorizedError';

export async function action({ context }: Route.LoaderArgs) {
    const { backend } = context;

    if (!backend.authStore.isValid) {
        throw new UnauthorizedError();
    }

    await backend
        .collection('vote_users')
        .update(backend.authStore.record!.id, {
            updated: new Date().toISOString(),
        });

    return new Response(null, {
        status: 201,
    });
}
