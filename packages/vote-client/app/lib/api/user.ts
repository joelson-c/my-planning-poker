import type { VotingUser } from '@planningpoker/domain-models';
import { getAuthenticatedHttpClient } from '../http.server';

export async function getCurrentUser(token: string) {
    const httpClient = getAuthenticatedHttpClient(token);
    const {
        data: { user },
    } = await httpClient.get<{ user: VotingUser }>('user/me');

    return user;
}

export async function sendVote(token: string, value: string) {
    const httpClient = getAuthenticatedHttpClient(token);
    const {
        data: { user },
    } = await httpClient.post<{ user: VotingUser }>('user/vote', {
        value,
    });

    return user;
}
