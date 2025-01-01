import { createCookie, createCookieSessionStorage } from 'react-router';

type SessionData = {
    prevNickname: string;
    prevPassword: string;
    backendAuth: string;
};

export const sessionCookie = createCookie('__session', {
    httpOnly: true,
    maxAge: 60 * 60 * 24, // 1 day
    secrets: [import.meta.env.VITE_SESSION_SECRET],
    secure: true,
});

const { getSession, commitSession, destroySession } =
    createCookieSessionStorage<SessionData>({
        cookie: sessionCookie,
    });

export { getSession, commitSession, destroySession };
