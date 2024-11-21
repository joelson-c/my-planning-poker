import { createCookieSessionStorage } from '@remix-run/node'; // or cloudflare/deno
import { env } from './environment.server';

interface SessionData {
    serverToken: string;
}

export const { getSession, commitSession, destroySession } =
    createCookieSessionStorage<SessionData>({
        cookie: {
            name: '__session',
            secrets: env.SESSION_SECRET.split(','),
            httpOnly: true,
        },
    });
