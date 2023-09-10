import { Button } from "@nextui-org/react";
import useRoomData from "../hooks/useRoomData";
import { useState } from "react";

type RoomActionsProps = {
    onResetRequested: () => void;
    onCardReveal: () => void;
};

const ACTION_DELAY_MS = 1000;

export default function RoomActions({ onResetRequested, onCardReveal }: RoomActionsProps) {
    const { meta: roomMeta, ping } = useRoomData();
    const [isLoading, setIsLoading] = useState(false);

    function getActionDelay(): number {
        return Math.max(0, ACTION_DELAY_MS - ping);
    }

    function onActionClick(callback: () => void) {
        setIsLoading(true);
        setTimeout(() => {
            callback();
            setIsLoading(false);
        }, getActionDelay());
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
