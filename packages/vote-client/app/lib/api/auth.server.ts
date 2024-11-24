import type { AuthenticationData } from './authentication-data';
import type { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import { env } from '../environment.server';
import { getAuthenticatedHttpClient, httpClient } from '../http.server';
import { getSession } from '../session';
import { MissingAuthToken } from './errors/MissingAuthToken';

export async function refreshToken(request: Request) {
    const { rawToken: oldToken } = await validateAndGetToken(request);
    const {
        data: { token },
    } = await getAuthenticatedHttpClient(oldToken).post<{ token: string }>(
        'auth/revalidate',
    );

    const session = await getSession(request.headers.get('Cookie'));
    session.set('serverToken', token);

    return {
        session,
        token,
    };
}

export async function validateToken(token: string) {
    return new Promise<{ rawToken: string; data: JwtPayload }>(
        (resolve, reject) => {
            jwt.verify(token, env.AUTH_JWT_PUBLIC_KEY, (err, decoded) => {
                if (err || !decoded) {
                    reject(err);
                    return;
                }

                resolve({
                    rawToken: token,
                    data: decoded as JwtPayload,
                });
            });
        },
    );
}

export async function validateAndGetToken(request: Request) {
    const token = await getServerToken(request);
    try {
        return await validateToken(token);
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Response('Unauthorized', { status: 401 });
        }

        throw error;
    }
}

export async function isAuthenticated(request: Request) {
    try {
        await validateAndGetToken(request);
        return true;
    } catch (error) {
        if (
            error instanceof MissingAuthToken ||
            error instanceof jwt.JsonWebTokenError
        ) {
            return false;
        }

        throw error;
    }
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

async function getServerToken(request: Request) {
    const session = await getSession(request.headers.get('Cookie'));
    const token = session.get('serverToken');
    if (!token) {
        throw new MissingAuthToken();
    }

    return token;
}
