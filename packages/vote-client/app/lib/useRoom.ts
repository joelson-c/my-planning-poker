import type { Room, RoomState } from '~/types/room';
import type { User } from '~/types/user';
import { useEffect, useRef } from 'react';
import { useRevalidator } from 'react-router';
import { useDecodedEvent } from './useEventSource';
import { useEventSource } from 'remix-utils/sse/react';

export function useRoom(roomId: string) {
    const realtimeUrl = `/room/${roomId}/realtime`;
    const revalidator = useRevalidator();
    const prevRoomState = useRef<RoomState | null>(null);

    const disconnect = useEventSource(realtimeUrl, {
        event: 'disconnect',
    });

    const room = useDecodedEvent<Room>(realtimeUrl, {
        event: 'room',
        enabled: disconnect === null,
    });

    const users = useDecodedEvent<User[]>(realtimeUrl, {
        event: 'users',
        enabled: disconnect === null,
    });

    useEffect(() => {
        if (!disconnect) {
            return;
        }

        revalidator.revalidate();
    }, [disconnect, revalidator]);

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
