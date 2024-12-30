import { posix } from 'node:path';
import { createRequestHandler, type ServerBuild } from 'react-router';
import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import { requestId } from 'hono/request-id';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/bun';

declare module 'react-router' {
    export interface AppLoadContext {
        VALUE_FROM_CLOUDFLARE: string;
    }
}

const app = new Hono();

const serverBuild: ServerBuild = await import(
    // @ts-expect-error - virtual module provided by React Router at build time
    'virtual:react-router/server-build'
);

const requestHandler = createRequestHandler(
    () => serverBuild,
    import.meta.env.MODE,
);

app.use(
    posix.join(serverBuild.publicPath, 'assets', '*'),
    serveStatic({
        root: serverBuild.assetsBuildDirectory,
        onFound: (_path, c) => {
            c.header('Cache-Control', `public, immutable, max-age=31536000`);
        },
    }),
);

app.use(
    posix.join(serverBuild.publicPath, '*'),
    serveStatic({
        root: serverBuild.assetsBuildDirectory,
    }),
);

app.use(
    serveStatic({
        root: 'public',
        onFound: (_path, c) => {
            c.header('Cache-Control', `public, max-age=31536000`);
        },
    }),
);

app.use(logger());
app.use(secureHeaders());
app.use(requestId());
app.use((context) =>
    requestHandler(context.req.raw, {
        VALUE_FROM_CLOUDFLARE: new Date().toISOString(),
    }),
);

export default app;
