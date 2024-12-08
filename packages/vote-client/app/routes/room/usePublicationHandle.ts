import type {
    BroadcastEvent,
    NewRoomStateEvent,
} from '@planningpoker/domain-models';
import { useNavigate } from '@remix-run/react';
import type { PublicationContext } from 'centrifuge';
import { useCallback } from 'react';

interface PublicationHandleOptions {
    roomId: string;
}

export function usePublicationHandle({ roomId }: PublicationHandleOptions) {
    const navigate = useNavigate();

    const onStateUpdate = useCallback(
        (message: NewRoomStateEvent) => {
            switch (message.state) {
                case 'VOTING':
                    navigate(`/room/${roomId}`);
                    break;
                case 'REVEAL':
                    navigate(`/room/${roomId}/result`);
                    break;
            }
        },
        [navigate, roomId],
    );

    const onPublication = useCallback(
        (publication: PublicationContext) => {
            const message = publication.data as BroadcastEvent;
            switch (message.type) {
                case 'ROOM_STATE_UPDATE':
                    onStateUpdate(message);
                    break;
            }
        },
        [onStateUpdate],
    );

    return onPublication;
}
