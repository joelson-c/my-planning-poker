import type { Route } from './+types/heartbeat';

export async function action({ context }: Route.LoaderArgs) {
    const { backend } = context;

    if (!backend.authStore.isValid) {
        return new Response(null, {
            status: 401,
        });
    }

    /*  await backend
        .collection('vote_users')
        .update(backend.authStore.record!.id, {
            updated: new Date().toISOString(),
        }); */

    return new Response(null, {
        status: 201,
    });
}
