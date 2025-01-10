import { useEffect } from 'react';
import { useFetcher } from 'react-router';

const HEARTBEAT_INTERVAL_MS = 1000 * 60; // 1 minute

export function useHeartbeat() {
    const fetcher = useFetcher();

    useEffect(() => {
        function sendHeartbeat() {
            fetcher.submit(null, {
                action: `/heartbeat`,
                method: 'POST',
            });
        }

        const interval = setInterval(
            () => sendHeartbeat(),
            HEARTBEAT_INTERVAL_MS,
        );

        sendHeartbeat();
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
