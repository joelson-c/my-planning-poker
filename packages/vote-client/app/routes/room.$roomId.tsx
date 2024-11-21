import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import type { Error as CentrifugeError } from 'centrifuge';
import { json, Outlet, redirect, useLoaderData } from '@remix-run/react';
import { useCallback, useEffect, useState } from 'react';
import { JoiningSpinner } from '~/components/room/joiningSpinner';
import { getServerToken as getAndRefreshAuthToken } from '~/lib/api/auth.server';
import { roomExists } from '~/lib/api/room';
import { getRealtimeClient, getRoomSubscription } from '~/lib/realtime';
import { env } from '~/lib/environment.server';
import { useToast } from '~/hooks/use-toast';
import { commitSession } from '~/lib/session';

export async function loader({ params, request }: LoaderFunctionArgs) {
    if (!params.roomId) {
        throw new Response('Not Found', { status: 404 });
    }

    const authResult = await getAndRefreshAuthToken(request);
    if (!authResult) {
        return redirect(`/join/${params.roomId}`);
    }

    const exists = await roomExists(params.roomId);
    if (!exists) {
        throw new Response('Not Found', { status: 404 });
    }

    return json(
        {
            authToken: authResult.token,
            realtimeEndpoint: env.REALTIME_ENDPOINT,
            apiEndpoint: env.REALTIME_AUTH_ENDPOINT,
            roomId: params.roomId,
        },
        {
            headers: {
                'Set-Cookie': await commitSession(authResult.session),
            },
        },
    );
}

export const meta: MetaFunction = () => {
    return [{ title: 'Voting Room - My Planning Poker' }];
};

export default function Room() {
    const { authToken, realtimeEndpoint, apiEndpoint, roomId } =
        useLoaderData<typeof loader>();
    const [isJoined, setIsJoined] = useState(false);
    const { toast } = useToast();

    const onConnectionError = useCallback(
        (error: CentrifugeError) => {
            console.error('Centrifuge connection error:', error);

            toast({
                title: 'Connection Error',
                description:
                    'An error occurred while connecting to the server. ' +
                    'Please check your internet connection and try again.',
            });
        },
        [toast],
    );

    useEffect(() => {
        const client = getRealtimeClient(
            realtimeEndpoint,
            apiEndpoint,
            authToken,
        );
        client.on('error', ({ error }) => onConnectionError(error));
        client.connect();

        const subscription = getRoomSubscription(
            client,
            roomId,
            apiEndpoint,
            authToken,
        );
        subscription.subscribe();
        subscription.on('error', ({ error }) => onConnectionError(error));
        subscription.on('subscribed', () => {
            setIsJoined(true);
        });

        return () => {
            subscription.unsubscribe();
            client.disconnect();
        };
    }, [apiEndpoint, authToken, onConnectionError, realtimeEndpoint, roomId]);

    if (!isJoined) {
        return <JoiningSpinner />;
    }

    return <Outlet />;
}
