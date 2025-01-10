import type { Route } from './+types/realtime';
import type { User } from '~/types/user';
import { EventSource } from 'eventsource';
import { eventStream } from 'remix-utils/sse/server';
import { UnauthorizedError } from '~/lib/errors/UnauthorizedError';

global.EventSource = EventSource;

export async function loader({
    request,
    params: { roomId },
    context: { backend },
}: Route.LoaderArgs) {
    const room = await backend.collection('voteRooms').getOne(roomId);
    const roomUsersFilter = backend.filter('room={:roomId}', {
        roomId,
    });

    const users = await backend.collection('voteUsers').getFullList({
        skipTotal: true,
        filter: roomUsersFilter,
    });

    if (!backend.authStore.isValid || !backend.authStore.record) {
        throw new UnauthorizedError();
    }

    const currentUserId = backend.authStore.record.id;

    return eventStream(request.signal, (send, abort) => {
        async function run() {
            let usersToSend: User[] = users;

            await backend
                .collection('voteRooms')
                .subscribe(room.id, (event) => {
                    send({
                        event: 'room',
                        data: JSON.stringify(event.record),
                    });
                });

            await backend.collection('voteUsers').subscribe(
                '*',
                (event) => {
                    switch (event.action) {
                        case 'delete':
                            if (event.record.id === currentUserId) {
                                send({
                                    event: 'disconnect',
                                    data: '',
                                });

                                abort();
                            }

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
                .collection('voteRooms')
                .unsubscribe(roomId)
                .catch((error) =>
                    console.error(
                        'Failed to disconnect user from room feed: %s',
                        error,
                    ),
                );

            backend
                .collection('voteUsers')
                .unsubscribe('*')
                .catch((error) =>
                    console.error(
                        'Failed to disconnect user from room users feed: %s',
                        error,
                    ),
                );

            /* backend
                .collection('voteUsers')
                .update(backend.authStore.record!.id, {
                    room: '',
                })
                .catch((error) =>
                    console.error('Failed to delete room user: %s', error),
                ); */
        };
    });
}
