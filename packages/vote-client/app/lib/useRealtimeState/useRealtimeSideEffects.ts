import { useEffect } from 'react';
import type { InboundMessage } from './messages';
import { toast } from '../useToast';
import { useNavigate } from 'react-router';

export function useRealtimeSideEffects(
    roomId: string,
    lastJsonMessage: InboundMessage | null,
) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!lastJsonMessage) {
            return;
        }

        if (lastJsonMessage.name === 'WS_USER_REMOVED') {
            toast({
                title: 'User removed',
                description: `${lastJsonMessage.data.nickname} was removed from the room.`,
                variant: 'destructive',
            });
        }

        if (lastJsonMessage.name === 'WS_ROOM_STATE_CHANGED') {
            if (lastJsonMessage.data.state === 'REVEAL') {
                navigate(`/room/${roomId}/result`);
            } else if (lastJsonMessage.data.state === 'VOTING') {
                navigate(`/room/${roomId}`);
            }
        }
    }, [lastJsonMessage, navigate, roomId]);
}
