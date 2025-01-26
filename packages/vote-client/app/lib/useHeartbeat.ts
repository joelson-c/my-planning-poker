import { useEffect } from 'react';
import { backendClient } from './backend/client';

const HEARTBEAT_INTERVAL_MS = 1000 * 60; // 1 minute

export function useHeartbeat() {
    useEffect(() => {
        function sendHeartbeat() {
            backendClient.send(`/api/vote/heartbeat`, {
                method: 'POST',
            });
        }

        const interval = setInterval(
            () => sendHeartbeat(),
            HEARTBEAT_INTERVAL_MS,
        );

        return () => clearInterval(interval);
    }, []);
}
