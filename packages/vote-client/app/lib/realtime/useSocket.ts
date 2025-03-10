import { useSyncExternalStore } from 'react';
import { getSocket } from './socket';

export function useSocket() {
    const socket = getSocket();
    const store = useSyncExternalStore(socket.subscribe, socket.getSnapshot);
    return {
        ...store,
        sendMessage: socket.sendMessage,
    };
}
