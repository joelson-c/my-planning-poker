import { useState } from 'react';

import { Button } from '@nextui-org/react';

import { useRootStore } from '../../state/rootStore';
import useDelayedPromise from '../../hooks/useDelayedPromise';

type RoomActionsProps = {
    onResetRequested: () => void;
    onCardReveal: () => void;
    onRoomShare: () => void;
};

const ACTION_DELAY_MS = 1000;

export default function RoomActions({ onResetRequested, onCardReveal, onRoomShare }: RoomActionsProps) {
    const roomMeta = useRootStore((state) => state.roomMeta);
    const currentRoomUser = useRootStore((state) => state.getMyRemoteUser());
    const [isLoading, setIsLoading] = useState(false);
    const delayedPromise = useDelayedPromise(ACTION_DELAY_MS);

    async function onActionClick(callback: () => void) {
        setIsLoading(true);
        await delayedPromise();
        callback();
        setIsLoading(false);
    }

    if (!currentRoomUser?.isModerator) {
        return null;
    }

    return (
        <div className='flex gap-4 justify-self-center mb-3'>
            {roomMeta?.hasRevealedCards ?
                (
                    <Button
                        type='button'
                        onClick={() => onActionClick(onResetRequested)}
                        isLoading={isLoading}
                        color="primary"
                    >
                        Resetar
                    </Button>
                ) : (
                    <Button
                        type='button'
                        onClick={() => onActionClick(onCardReveal)}
                        isLoading={isLoading}
                        color="primary"
                    >
                        Revelar votos
                    </Button>
                )}
            <Button
                type='button'
                onClick={() => onRoomShare()}
                color="success"
            >
                Copiar link da sala
            </Button>
        </div>
    );
}
