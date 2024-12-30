import type { EntryContext } from 'react-router';
import { ServerRouter } from 'react-router';
import { isbot } from 'isbot';
// @ts-expect-error Dependency mismatch when running via dev server
import { renderToReadableStream } from 'react-dom/server.bun';

export default async function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    routerContext: EntryContext,
) {
    const stream = await renderToReadableStream(
        <ServerRouter context={routerContext} url={request.url} />,
        {
            signal: request.signal,
            onError(error: unknown) {
                // Log streaming rendering errors from inside the shell
                console.error(error);
                responseStatusCode = 500;
            },
        },
    );

    const userAgent = request.headers.get('user-agent');
    if (userAgent && isbot(userAgent)) {
        await stream.allReady;
    }

    responseHeaders.set('Content-Type', 'text/html');
    return new Response(stream, {
        headers: responseHeaders,
        status: responseStatusCode,
    });
}
