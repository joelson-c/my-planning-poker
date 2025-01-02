import 'react-router';
import { createRequestHandler } from '@react-router/express';
import express from 'express';
import { createBackend, type Backend } from './backend';

declare module 'react-router' {
    interface AppLoadContext {
        backend: Backend;
    }
}

declare module 'express-serve-static-core' {
    interface Request {
        backend?: Backend;
    }
}

export const app = express();

app.use(async (req, res, next) => {
    const backend = await createBackend(req, res);

    const requestHandler = createRequestHandler({
        // @ts-expect-error - virtual module provided by React Router at build time
        build: () => import('virtual:react-router/server-build'),
        getLoadContext() {
            return {
                backend,
            };
        },
    });

    return requestHandler(req, res, next);
});
