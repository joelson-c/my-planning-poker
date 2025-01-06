import {
    createCookie,
    createCookieSessionStorage,
    type Session,
} from 'react-router';

export type CachedUser = {
    nickname: string;
    password: string;
    roomId: string;
};

type SessionData = {
    lastNickname: string;
    lastCreatedUserId: string;
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

export type AppSession = Session<SessionData, SessionFlashData>;

export { getSession, commitSession, destroySession };
