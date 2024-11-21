import { Centrifuge } from 'centrifuge';
import axios from 'axios';

const CHANNEL_PREFIX = 'vote';

async function getConnectionToken(apiEndpoint: string, authToken: string) {
    try {
        const {
            data: { token },
        } = await axios.post<{ token: string }>('realtime/connection', null, {
            baseURL: apiEndpoint,
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });

        return token;
    } catch (error) {
        if (!axios.isAxiosError(error)) {
            throw error;
        }

        if (error.response?.status === 401) {
            throw new Centrifuge.UnauthorizedError('Unauthorized');
        }

        throw error;
    }
}

async function getSubscriptionToken(
    roomId: string,
    apiEndpoint: string,
    authToken: string,
) {
    try {
        const {
            data: { token },
        } = await axios.post<{ token: string }>(
            `realtime/subscription/create/${roomId}`,
            null,
            {
                baseURL: apiEndpoint,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        return token;
    } catch (error) {
        if (!axios.isAxiosError(error)) {
            throw error;
        }

        if (error.response?.status === 401) {
            throw new Centrifuge.UnauthorizedError('Unauthorized');
        }

        throw error;
    }
}

export function getRealtimeClient(
    realtimeEndpoint: string,
    apiEndpoint: string,
    authToken: string,
) {
    return new Centrifuge(realtimeEndpoint, {
        getToken: () => getConnectionToken(apiEndpoint, authToken),
    });
}

export function getRoomSubscription(
    client: Centrifuge,
    roomId: string,
    apiEndpoint: string,
    authToken: string,
) {
    return client.newSubscription(`${CHANNEL_PREFIX}:${roomId}`, {
        getToken: () => getSubscriptionToken(roomId, apiEndpoint, authToken),
    });
}
