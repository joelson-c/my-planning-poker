import { useEffect } from 'react';
import { useFetcher } from 'react-router';

const HEARTBEAT_INTERVAL_MS = 10_000;

export function useHeartbeat(roomId: string) {
    const fetcher = useFetcher();

    useEffect(() => {
        function sendHeartbeat() {
            fetcher.submit(null, {
                action: `/room/${roomId}/heartbeat`,
                method: 'POST',
            });
        }

        const interval = setInterval(
            () => sendHeartbeat(),
            HEARTBEAT_INTERVAL_MS,
        );

        sendHeartbeat();
        return () => clearInterval(interval);
    }, [roomId]);
}
