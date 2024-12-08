import { getAuthenticatedHttpClient } from '../http.server';

export async function getConnectionToken(authToken: string) {
    const httpClient = getAuthenticatedHttpClient(authToken);

    const {
        data: { token },
    } = await httpClient.post<{ token: string }>('realtime/connection');

    return token;
}

export async function getSubscriptionToken(authToken: string, roomId: string) {
    const httpClient = getAuthenticatedHttpClient(authToken);

    const {
        data: { token },
    } = await httpClient.post<{ token: string }>(
        `realtime/subscription/create/${roomId}`,
    );

    return token;
}
