import { useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';

import { Button } from '@nextui-org/react';

import useDelayedPromise from '../../hooks/useDelayedPromise';

export type FormAction = 'createRoom' | 'joinRoom';

type JoinActionsProps = {
    onActionRequested: (action: FormAction) => void;
};

const ACTION_DELAY_MS = 1000;

export default function RoomJoinActions({ onActionRequested }: JoinActionsProps) {
    const { roomId: urlRoomId } = useParams();
    const [loadingAction, setLoadingAction] = useState<FormAction | null>(null);
    const delayedPromise = useDelayedPromise(ACTION_DELAY_MS);

    async function onActionClick(action: FormAction) {
        setLoadingAction(action);
        await delayedPromise();
        onActionRequested(action);
        setLoadingAction(null);
    }

    const primaryAction = useMemo<FormAction>(
        () => urlRoomId ? 'joinRoom' : 'createRoom',
        [urlRoomId]
    );

    return (
        <div className="flex gap-4 w-full">
            <Button
                type="submit"
                onClick={() => onActionClick(primaryAction)}
                color="primary"
                isLoading={loadingAction === primaryAction}
                isDisabled={!!loadingAction && loadingAction !== primaryAction}
                className="flex-1"
            >
                {urlRoomId ? 'Entrar na sala' : 'Criar sala'}
            </Button>
            {urlRoomId && (
                <Button
                    type="submit"
                    color="secondary"
                    onClick={() => onActionClick('createRoom')}
                    isLoading={loadingAction === 'createRoom'}
                    isDisabled={!!loadingAction && loadingAction !== 'createRoom'}
                    className="flex-1"
                >
                    Criar sala
                </Button>
            )}
        </div>
    );
}
