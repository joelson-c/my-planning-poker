import { useCallback } from "react";
import { useRootStore } from "../state/rootStore";

export default function useDelayedPromise(delayMs: number): () => Promise<void> {
    const ping = useRootStore((state) => state.connectionPing);

    const getActionDelay = useCallback(() => Math.max(0, delayMs - ping), [delayMs, ping]);

    const delayedPromise = useCallback(() => {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, getActionDelay());
        });
    }, [getActionDelay]);

    return delayedPromise;
}
