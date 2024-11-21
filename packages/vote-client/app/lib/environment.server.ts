import { type, string, create } from 'superstruct';

const envModel = type({
    BACKEND_ENDPOINT: string(),
    SESSION_SECRET: string(),
    AUTH_JWT_PUBLIC_KEY: string(),
    REALTIME_ENDPOINT: string(),
    REALTIME_AUTH_ENDPOINT: string(),
});

export const env = create(process.env, envModel);
