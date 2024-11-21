import type { AuthenticationData } from './authentication-data';
import jwt from 'jsonwebtoken';
import { env } from '../environment.server';
import { getAuthenticatedHttpClient, httpClient } from '../http.server';
import { getSession } from '../session';

export async function refreshToken(authToken: string) {
    const {
        data: { token },
    } = await getAuthenticatedHttpClient(authToken).post<{ token: string }>(
        'auth/revalidate',
    );
    return token;
}

export async function getServerToken(request: Request) {
    const session = await getSession(request.headers.get('Cookie'));
    const token = session.get('serverToken');
    if (!token) {
        return null;
    }

    const newToken = await refreshToken(token);
    session.set('serverToken', token);

    return new Promise<{ token: string; session: typeof session } | null>(
        (resolve, reject) => {
            jwt.verify(token, env.AUTH_JWT_PUBLIC_KEY, (err, decoded) => {
                if (err) {
                    resolve(null);
                    return;
                }

                if (!decoded) {
                    reject(new Error('Invalid token'));
                    return;
                }

                resolve({
                    token: newToken,
                    session,
                });
            });
        },
    );
}

export async function isAuthenticated(request: Request) {
    const serverToken = await getServerToken(request);
    return serverToken !== null;
}

export async function authenticate(
    request: Request,
    authData: Pick<AuthenticationData, 'nickname'>,
) {
    const session = await getSession(request.headers.get('Cookie'));
    const {
        data: { token },
    } = await httpClient.post<{ token: string }>('auth/login-anonymous', {
        ...authData,
    });

    session.set('serverToken', token);
    return {
        session,
        token,
    };
}
