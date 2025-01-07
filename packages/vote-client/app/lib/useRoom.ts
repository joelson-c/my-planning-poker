import type { Room, RoomState } from '~/types/room';
import type { User } from '~/types/user';
import { useEffect, useRef } from 'react';
import { useRevalidator } from 'react-router';
import { useDecodedEvent } from './useEventSource';

export function useRoom(roomId: string) {
    const realtimeUrl = `/room/${roomId}/realtime`;
    const revalidator = useRevalidator();
    const prevRoomState = useRef<RoomState | null>(null);

    const room = useDecodedEvent<Room>(realtimeUrl, {
        event: 'room',
    });

    const users = useDecodedEvent<User[]>(realtimeUrl, {
        event: 'users',
    });

    const roomError = useDecodedEvent<Room>(realtimeUrl, {
        event: 'error',
    });

    useEffect(() => {
        if (!roomError) {
            return;
        }

        revalidator.revalidate();
    }, [roomError, revalidator]);

    useEffect(() => {
        if (!room) {
            return;
        }

        if (!prevRoomState.current) {
            prevRoomState.current = room.state;
            return;
        }

        if (prevRoomState.current === room.state) {
            return;
        }

        prevRoomState.current = room.state;
        revalidator.revalidate();
    }, [room, revalidator]);

    return {
        room,
        users,
    };
}
