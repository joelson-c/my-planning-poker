import type { Subscription, Error as CentrifugeError } from 'centrifuge';
import { Centrifuge } from 'centrifuge';
import { useCallback, useEffect, useState } from 'react';

const CHANNEL_PREFIX = 'vote';

interface CentrifugeHookOptions {
    roomId: string;
    realtimeEndpoint: string;
    onConnectionError: (error: CentrifugeError) => void;
}

export function useCentrifuge({
    roomId,
    realtimeEndpoint,
    onConnectionError,
}: CentrifugeHookOptions) {
    const [client, setClient] = useState<Centrifuge | undefined>();
    const [isJoined, setIsJoined] = useState(false);
    const [subscription, setSubscription] = useState<
        Subscription | undefined
    >();

    const getConnectionToken = async () => {
        const tokenResponse = await fetch('/realtime/connection', {
            method: 'POST',
            credentials: 'include',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        const { token } = await tokenResponse.json();
        return token;
    };

    const getSubscriptionToken = useCallback(async () => {
        const tokenResponse = await fetch(`/realtime/${roomId}/subscription`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        const { token } = await tokenResponse.json();
        return token;
    }, [roomId]);

    useEffect(() => {
        const client = new Centrifuge(realtimeEndpoint, {
            getToken: () => getConnectionToken(),
        });

        setClient(client);

        const subscription = client.newSubscription(
            `${CHANNEL_PREFIX}:${roomId}`,
            {
                getToken: () => getSubscriptionToken(),
            },
        );

        setSubscription(subscription);

        return () => {
            subscription.unsubscribe();
            client.disconnect();
        };
    }, [getSubscriptionToken, realtimeEndpoint, roomId]);

    useEffect(() => {
        subscription?.subscribe();
        subscription?.on('error', ({ error }) => onConnectionError(error));
        subscription?.on('subscribed', () => {
            setIsJoined(true);
        });

        subscription?.on('publication', (ctx) => {
            console.log(ctx);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, [subscription, onConnectionError]);

    useEffect(() => {
        client?.on('error', ({ error }) => onConnectionError(error));
        client?.connect();

        return () => {
            client?.disconnect();
        };
    }, [client, onConnectionError]);

    return {
        client,
        subscription,
        isJoined,
    };
}
