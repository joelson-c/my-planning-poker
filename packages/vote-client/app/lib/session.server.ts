import { createCookie, createCookieSessionStorage } from 'react-router';

type SessionData = {
    prevNickname: string;
    prevPassword: string;
    backendAuth: string;
};

type SessionFlashData = {
    error: string;
};

export const sessionCookie = createCookie('__session', {
    httpOnly: true,
    maxAge: 60 * 60 * 24, // 1 day
    secrets: [import.meta.env.VITE_SESSION_SECRET],
    secure: true,
});

const { getSession, commitSession, destroySession } =
    createCookieSessionStorage<SessionData, SessionFlashData>({
        cookie: sessionCookie,
    });

export type AppSession = Awaited<ReturnType<typeof getSession>>;

export { getSession, commitSession, destroySession };
