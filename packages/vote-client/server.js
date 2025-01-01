import compression from 'compression';
import express from 'express';
import morgan from 'morgan';

// Short-circuit the type-checking of the built output.
const BUILD_PATH = './build/server/index.js';
const PRODUCTION = process.env.NODE_ENV === 'production';
const PORT = Number.parseInt(process.env.PORT || '3000');
const HOST = process.env.HOST || 'localhost';

const app = express();

app.use(compression());
app.disable('x-powered-by');
app.use(morgan('tiny'));

async function createProdServer() {
    console.log('Starting production server');
    app.use(
        '/assets',
        express.static('build/client/assets', {
            immutable: true,
            maxAge: '1y',
        }),
    );
    app.use(express.static('build/client', { maxAge: '1h' }));
    app.use(await import(BUILD_PATH).then((mod) => mod.app));

    app.listen(PORT, HOST, () => {
        console.log(`Server is running on http://${HOST}:${PORT}`);
    });
}

async function createDevServer() {
    console.log('Starting development server');

    const vite = await import('vite');
    const viteDevServer = await vite.createServer({
        server: { middlewareMode: true },
        appType: 'custom',
    });

    app.use(viteDevServer.middlewares);

    app.use(async (req, res, next) => {
        try {
            const source = await viteDevServer.ssrLoadModule(
                './server/app.ts',
                true,
            );
            return await source.app(req, res, next);
        } catch (error) {
            if (typeof error === 'object' && error instanceof Error) {
                viteDevServer.ssrFixStacktrace(error);
            }

            next(error);
        }
    });

    app.listen(PORT, HOST, () => {
        console.log(`Server is running on http://${HOST}:${PORT}`);
    });
}

if (PRODUCTION) {
    createProdServer();
} else {
    createDevServer();
}
