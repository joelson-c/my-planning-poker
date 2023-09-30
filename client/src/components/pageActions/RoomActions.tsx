import { Button } from "@nextui-org/react";
import useRoomData from "../../hooks/useRoomData";
import { useState } from "react";
import useDelayedPromise from "../../hooks/useDelayedPromise";

type RoomActionsProps = {
    onResetRequested: () => void;
    onCardReveal: () => void;
};

const ACTION_DELAY_MS = 1000;

export default function RoomActions({ onResetRequested, onCardReveal }: RoomActionsProps) {
    const { meta: roomMeta } = useRoomData();
    const [isLoading, setIsLoading] = useState(false);
    const delayedPromise = useDelayedPromise(ACTION_DELAY_MS);

    async function onActionClick(callback: () => void) {
        setIsLoading(true);
        await delayedPromise();
        callback();
        setIsLoading(false);
    }

    return (
        <>
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
        </>
    );
}
