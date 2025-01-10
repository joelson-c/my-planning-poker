import type { Route } from './+types';

export async function action({ context }: Route.LoaderArgs) {
    const { backend } = context;

    if (!backend.authStore.isValid) {
        return new Response(null, {
            status: 401,
        });
    }

    await backend.send(`/api/vote/heartbeat`, {
        method: 'POST',
    });

    return new Response(null, {
        status: 201,
    });
}
