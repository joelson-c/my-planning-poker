import type { Route } from './+types/room';
import { EventSource } from 'eventsource';
import { eventStream } from 'remix-utils/sse/server';
import { ClientResponseError } from 'pocketbase';
import { commitSession, getSession } from '~/lib/session.server';
import type { Room } from '~/types/room';

global.EventSource = EventSource;

export async function loader({ request, params, context }: Route.LoaderArgs) {
    const { backend } = context;
    const session = await getSession(request.headers.get('Cookie'));

    if (!backend.authStore.isValid) {
        session.flash('error', 'You must be joined to vote in this room.');
        return new Response(null, {
            status: 401,
            headers: { 'Set-Cookie': await commitSession(session) },
        });
    }

    const { roomId } = params;
    let room;
    try {
        room = await backend
            .collection('vote_rooms')
            .getOne(roomId, { expand: 'users' });
    } catch (error) {
        if (!(error instanceof ClientResponseError)) {
            throw error;
        }

        session.flash(
            'error',
            'The room does not exist, is closed, or is full.',
        );

        return new Response(null, {
            status: 404,
            headers: { 'Set-Cookie': await commitSession(session) },
        });
    }

    return eventStream(request.signal, (send, abort) => {
        async function run(room: Room) {
            await backend.collection('vote_rooms').subscribe(
                room.id,
                (event) => {
                    send({
                        event: 'room',
                        data: JSON.stringify(event.record),
                    });
                },
                {
                    expand: 'users',
                },
            );

            send({
                event: 'room',
                data: JSON.stringify(room),
            });
        }

        run(room);

        backend.realtime.onDisconnect = (activeSubscriptions) => {
            if (activeSubscriptions.length > 0) {
                abort();
            }
        };

        return () => {
            Promise.all([
                backend.collection('vote_rooms').unsubscribe(roomId),
                backend.collection('vote_rooms').update(roomId, {
                    'users-': [backend.authStore.record!.id],
                }),
            ]).catch((error) =>
                console.error('Failed to disconnect user from room: %s', error),
            );
        };
    });
}
