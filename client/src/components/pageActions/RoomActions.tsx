import { Button } from "@nextui-org/react";
import { useState } from "react";
import useDelayedPromise from "../../hooks/useDelayedPromise";
import { useRootStore } from "../../state/rootStore";

type RoomActionsProps = {
    onResetRequested: () => void;
    onCardReveal: () => void;
};

const ACTION_DELAY_MS = 1000;

export default function RoomActions({ onResetRequested, onCardReveal }: RoomActionsProps) {
    const roomMeta = useRootStore((state) => state.roomMeta);
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
