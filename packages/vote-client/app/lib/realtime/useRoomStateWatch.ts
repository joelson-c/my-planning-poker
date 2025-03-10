import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useSocket } from './useSocket';

export function useRoomStateWatch(roomId: string) {
    const { message } = useSocket();

    const navigate = useNavigate();

    useEffect(() => {
        if (!message) {
            return;
        }

        if (message.name === 'WS_REVEAL') {
            navigate(`/room/${roomId}/result`);
        }

        if (message.name === 'WS_RESET') {
            navigate(`/room/${roomId}`);
        }
    }, [message, navigate, roomId]);
}
