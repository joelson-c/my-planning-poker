import { PassThrough } from 'node:stream';

import type {
    ActionFunctionArgs,
    EntryContext,
    LoaderFunctionArgs,
} from 'react-router';
import { createReadableStreamFromReadable } from '@react-router/node';
import { ServerRouter } from 'react-router';
import { isbot } from 'isbot';
import type { RenderToPipeableStreamOptions } from 'react-dom/server';
import { renderToPipeableStream } from 'react-dom/server';
import { rollingCookie } from 'remix-utils/rolling-cookie';
import { sessionCookie } from './lib/session.server';

export const streamTimeout = 5_000;

export default function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    routerContext: EntryContext,
) {
    return new Promise((resolve, reject) => {
        let shellRendered = false;
        const userAgent = request.headers.get('user-agent');

        // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
        // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
        const readyOption: keyof RenderToPipeableStreamOptions =
            (userAgent && isbot(userAgent)) || routerContext.isSpaMode
                ? 'onAllReady'
                : 'onShellReady';

        const { pipe, abort } = renderToPipeableStream(
            <ServerRouter context={routerContext} url={request.url} />,
            {
                [readyOption]() {
                    shellRendered = true;
                    const body = new PassThrough();
                    const stream = createReadableStreamFromReadable(body);

                    responseHeaders.set('Content-Type', 'text/html');

                    resolve(
                        new Response(stream, {
                            headers: responseHeaders,
                            status: responseStatusCode,
                        }),
                    );

                    pipe(body);
                },
                onShellError(error: unknown) {
                    reject(error);
                },
                onError(error: unknown) {
                    responseStatusCode = 500;
                    // Log streaming rendering errors from inside the shell.  Don't log
                    // errors encountered during initial shell rendering since they'll
                    // reject and get logged in handleDocumentRequest.
                    if (shellRendered) {
                        console.error(error);
                    }
                },
            },
        );

        // Abort the rendering stream after the `streamTimeout` so it has tine to
        // flush down the rejected boundaries
        setTimeout(abort, streamTimeout + 1000);
    });
}

export async function handleDataRequest(
    response: Response,
    { request }: LoaderFunctionArgs | ActionFunctionArgs,
) {
    await rollingCookie(sessionCookie, request, response.headers);
    return response;
}
