import type { User } from '~/types/user';
import { useCallback, useSyncExternalStore } from 'react';
import { backendClient } from './backend/client';
import { UserDisconnectError } from './errors/UserDisconnectError';
import { ClientResponseError } from 'pocketbase';

let roomUsers: User[] = [];

function subscribeToRoomUsers(
    roomId: string,
    currentUserId: string,
    onStoreChange: VoidFunction,
) {
    backendClient
        .collection('voteUsers')
        .getFullList({
            skipTotal: true,
            filter: backendClient.filter('room={:roomId}', {
                roomId,
            }),
        })
        .then((room) => {
            roomUsers = room;
            onStoreChange();
        })
        .catch((error) => {
            if (error instanceof ClientResponseError && !error.isAbort) {
                throw error;
            }
        });

    backendClient.collection('voteUsers').subscribe('*', (event) => {
        switch (event.action) {
            case 'delete':
                if (event.record.id === currentUserId) {
                    throw new UserDisconnectError();
                }

                roomUsers = roomUsers.filter(
                    (user) => user.id !== event.record.id,
                );

                break;
            case 'create':
                roomUsers = [...roomUsers, event.record];
                break;
            case 'update':
                roomUsers = roomUsers.map((user) => {
                    if (user.id === event.record.id) {
                        return event.record;
                    }

                    return user;
                });

                break;
            default:
                return;
        }

        onStoreChange();
    });

    return () => {
        backendClient
            .collection('voteUsers')
            .unsubscribe('*')
            .catch(() => {
                // DO NOTHING
            });
    };
}

export function useRoomUsers(roomId: string, currentUserId: string) {
    const subscribe = useCallback(
        (onStoreChange: VoidFunction) =>
            subscribeToRoomUsers(roomId, currentUserId, onStoreChange),
        [currentUserId, roomId],
    );

    return useSyncExternalStore(subscribe, () => roomUsers);
}
