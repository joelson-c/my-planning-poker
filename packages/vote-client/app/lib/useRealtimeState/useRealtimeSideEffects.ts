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

        if (lastJsonMessage.name === 'WS_USER_DISCONNECTED') {
            toast({
                title: 'User removed',
                description: `${lastJsonMessage.data.nickname} was disconnected from the room.`,
                variant: 'destructive',
            });
        }

        if (lastJsonMessage.name === 'WS_RESET') {
            navigate(`/room/${roomId}`);
        }

        if (lastJsonMessage.name === 'WS_REVEAL') {
            navigate(`/room/${roomId}/result`);
        }
    }, [lastJsonMessage, navigate, roomId]);
}
