import type { Route } from './+types/realtime';
import { EventSource } from 'eventsource';
import { ClientResponseError } from 'pocketbase';
import { eventStream } from 'remix-utils/sse/server';
import type { Room } from '~/types/room';
import type { User } from '~/types/user';

global.EventSource = EventSource;

export async function loader({ request, params, context }: Route.LoaderArgs) {
    const { backend } = context;
    const { roomId } = params;

    let room: Room;
    try {
        room = await backend
            .collection('vote_rooms')
            .getOne(roomId, { expand: 'users' });
    } catch (error) {
        if (!(error instanceof ClientResponseError)) {
            throw error;
        }

        return new Response('The room does not exist', {
            status: 404,
        });
    }

    const roomUsersFilter = backend.filter('room={:roomId}', {
        roomId: params.roomId,
    });

    const users = await backend.collection('vote_users').getFullList({
        skipTotal: true,
        filter: roomUsersFilter,
    });

    return eventStream(request.signal, (send, abort) => {
        async function run() {
            let usersToSend: User[] = users;

            await backend
                .collection('vote_rooms')
                .subscribe(room.id, (event) => {
                    send({
                        event: 'room',
                        data: JSON.stringify(event.record),
                    });
                });

            await backend.collection('vote_users').subscribe(
                '*',
                (event) => {
                    switch (event.action) {
                        case 'delete':
                            usersToSend = usersToSend.filter(
                                (user) => user.id !== event.record.id,
                            );

                            break;
                        case 'create':
                            usersToSend = [...usersToSend, event.record];
                            break;
                        case 'update':
                            usersToSend = usersToSend.map((user) => {
                                if (user.id === event.record.id) {
                                    return event.record;
                                }

                                return user;
                            });

                            break;
                        default:
                            return;
                    }

                    send({
                        event: 'users',
                        data: JSON.stringify(usersToSend),
                    });
                },
                { filter: roomUsersFilter },
            );

            send({
                event: 'room',
                data: JSON.stringify(room),
            });

            send({
                event: 'users',
                data: JSON.stringify(users),
            });
        }

        run();

        backend.realtime.onDisconnect = (activeSubscriptions) => {
            if (activeSubscriptions.length > 0) {
                abort();
            }
        };

        return () => {
            backend
                .collection('vote_rooms')
                .unsubscribe(roomId)
                .catch((error) =>
                    console.error(
                        'Failed to disconnect user from room feed: %s',
                        error,
                    ),
                );

            backend
                .collection('vote_users')
                .unsubscribe('*')
                .catch((error) =>
                    console.error(
                        'Failed to disconnect user from room users feed: %s',
                        error,
                    ),
                );

            backend
                .collection('vote_users')
                .update(backend.authStore.record!.id, {
                    room: '',
                })
                .catch((error) =>
                    console.error('Failed to delete room user: %s', error),
                );
        };
    });
}
