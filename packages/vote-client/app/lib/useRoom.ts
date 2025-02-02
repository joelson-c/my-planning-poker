import type { Room } from '~/types/room';
import { useEffect, useState, useTransition } from 'react';
import { backendClient } from './backend/client';
import { useRevalidator } from 'react-router';

export function useRoom(roomId: string) {
    const [roomData, setRoomData] = useState<Room | undefined>(undefined);
    const [, startTransition] = useTransition();
    useEffect(() => {
        startTransition(async () => {
            const room = await backendClient
                .collection('voteRooms')
                .getOne(roomId);

            startTransition(() => {
                setRoomData(room);
            });
        });
    }, [roomId]);

    useEffect(() => {
        backendClient.collection('voteRooms').subscribe(roomId, (event) => {
            startTransition(() => {
                setRoomData(event.record);
            });
        });

        return () => {
            backendClient
                .collection('voteRooms')
                .unsubscribe(roomId)
                .catch(() => {
                    // DO NOTHING
                });
        };
    }, [roomId]);

    const revalidator = useRevalidator();
    useEffect(() => {
        if (!roomData?.state) {
            return;
        }

        revalidator.revalidate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomData?.state]);

    return roomData;
}
