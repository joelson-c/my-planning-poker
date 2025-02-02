import type { RecordSubscription } from 'pocketbase';
import type { User } from '~/types/user';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { backendClient } from './backend/client';
import { UserDisconnectError } from './errors/UserDisconnectError';

export function useRoomUsers(roomId: string, currentUserId: string) {
    const [roomUsers, setRoomUsers] = useState<User[]>([]);
    const [error, setError] = useState<Error | undefined>();
    const [, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            const users = await backendClient
                .collection('voteUsers')
                .getFullList({
                    skipTotal: true,
                    filter: backendClient.filter('room={:roomId}', {
                        roomId,
                    }),
                });

            startTransition(() => {
                setRoomUsers(users);
            });
        });
    }, [currentUserId, roomId]);

    const onUserUpdate = useCallback(
        (event: RecordSubscription<User>) => {
            let newUsers: User[] = [...roomUsers];
            switch (event.action) {
                case 'delete':
                    if (event.record.id === currentUserId) {
                        startTransition(() => {
                            setError(new UserDisconnectError());
                        });

                        return;
                    }

                    newUsers = newUsers.filter(
                        (user) => user.id !== event.record.id,
                    );

                    break;
                case 'create':
                    newUsers = [...newUsers, event.record];
                    break;
                case 'update':
                    newUsers = newUsers.map((user) => {
                        if (user.id === event.record.id) {
                            return event.record;
                        }

                        return user;
                    });

                    break;
                default:
                    return;
            }

            startTransition(() => {
                setRoomUsers(newUsers);
            });
        },
        [currentUserId, roomUsers],
    );

    useEffect(() => {
        backendClient.collection('voteUsers').subscribe('*', (event) => {
            onUserUpdate(event);
        });

        return () => {
            backendClient
                .collection('voteUsers')
                .unsubscribe('*')
                .catch(() => {
                    // DO NOTHING
                });
        };
    }, [currentUserId, onUserUpdate, roomId]);

    if (error) {
        throw error;
    }

    return roomUsers;
}
