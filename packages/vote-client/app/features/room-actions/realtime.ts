import type { Route } from './+types/realtime';
import type { User } from '~/types/user';
import { EventSource } from 'eventsource';
import { eventStream } from 'remix-utils/sse/server';

global.EventSource = EventSource;

export async function loader({ request, params, context }: Route.LoaderArgs) {
    const { backend } = context;
    const { roomId } = params;

    const room = await backend.collection('vote_rooms').getOne(roomId);
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

            /* backend
                .collection('vote_users')
                .update(backend.authStore.record!.id, {
                    room: '',
                })
                .catch((error) =>
                    console.error('Failed to delete room user: %s', error),
                ); */
        };
    });
}
