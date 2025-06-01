import { Presence, Socket } from 'phoenix';
import type { InitMessage, RoomStatus } from './messages';

export type InitResponse = {
    id: string;
    room: {
        id: string;
        status: RoomStatus;
    };
};

export function initRealtime({
    payload: { nickname, roomId, isObserver },
}: InitMessage) {
    const socket = new Socket(import.meta.env.VITE_BACKEND_ENDPOINT + '/room', {
        params: { nickname: nickname },
    });

    socket.connect();
    const channel = socket.channel(`room:${roomId}`, { observer: isObserver });
    const presence = new Presence(channel);
    return { socket, channel, presence };
}
