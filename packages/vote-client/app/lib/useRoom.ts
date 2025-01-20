import type { Room } from '~/types/room';
import { useCallback, useSyncExternalStore } from 'react';
import { backendClient } from './backend/client';
import { ClientResponseError } from 'pocketbase';

let roomData: Room | undefined = undefined;

function subscribeToRoom(roomId: string, onStoreChange: VoidFunction) {
    backendClient
        .collection('voteRooms')
        .getOne(roomId)
        .then((room) => {
            roomData = room;
            onStoreChange();
        })
        .catch((error) => {
            if (error instanceof ClientResponseError && !error.isAbort) {
                throw error;
            }
        });

    backendClient.collection('voteRooms').subscribe(roomId, (event) => {
        roomData = event.record;
        onStoreChange();
    });

    return () => {
        backendClient
            .collection('voteRooms')
            .unsubscribe(roomId)
            .catch(() => {
                // DO NOTHING
            });
    };
}

export function useRoom(roomId: string) {
    const subscribe = useCallback(
        (onStoreChange: VoidFunction) => subscribeToRoom(roomId, onStoreChange),
        [roomId],
    );

    return useSyncExternalStore(subscribe, () => roomData);
}
