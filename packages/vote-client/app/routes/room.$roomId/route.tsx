import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import type {
    Centrifuge,
    Error as CentrifugeError,
    Subscription,
} from 'centrifuge';
import { json, Outlet, redirect, useLoaderData } from '@remix-run/react';
import { useCallback, useEffect, useState } from 'react';
import { refreshToken } from '~/lib/api/auth.server';
import { getJoinedRoom } from '~/lib/api/room';
import { getRealtimeClient, getRoomSubscription } from '~/lib/realtime';
import { env } from '~/lib/environment.server';
import { useToast } from '~/hooks/use-toast';
import { commitSession } from '~/lib/session';
import { RoomProvider } from './RoomProvider';
import { getCurrentUser } from '~/lib/api/user';

export async function loader({ params, request }: LoaderFunctionArgs) {
    if (!params.roomId) {
        throw new Response(null, { status: 404 });
    }

    const newAuthToken = await refreshToken(request);
    if (!newAuthToken) {
        throw new Error('Unable to refresh token');
    }

    const joinedRoom = await getJoinedRoom(newAuthToken.token);
    if (!joinedRoom) {
        return redirect(`/join/${params.roomId}`);
    }

    const currentUser = await getCurrentUser(newAuthToken.token);

    return json(
        {
            authToken: newAuthToken.token, // TODO: Remove
            realtimeEndpoint: env.REALTIME_ENDPOINT,
            apiEndpoint: env.REALTIME_AUTH_ENDPOINT,
            room: joinedRoom,
            user: currentUser,
        },
        {
            headers: {
                'Set-Cookie': await commitSession(newAuthToken.session),
            },
        },
    );
}

export const meta: MetaFunction = () => {
    return [{ title: 'Voting Room - My Planning Poker' }];
};

export default function Room() {
    const { authToken, realtimeEndpoint, apiEndpoint, room, user } =
        useLoaderData<typeof loader>();
    const [isJoined, setIsJoined] = useState(false);
    const [client, setClient] = useState<Centrifuge | undefined>();
    const [subscription, setSubscription] = useState<
        Subscription | undefined
    >();
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

        setClient(client);

        const subscription = getRoomSubscription(
            client,
            room.id,
            apiEndpoint,
            authToken,
        );

        setSubscription(subscription);

        return () => {
            client?.disconnect();
            subscription?.unsubscribe();
        };
    }, [apiEndpoint, authToken, realtimeEndpoint, room.id]);

    useEffect(() => {
        subscription?.subscribe();
        subscription?.on('error', ({ error }) => onConnectionError(error));
        subscription?.on('subscribed', () => {
            setIsJoined(true);
        });

        subscription?.on('publication', (ctx) => {
            console.log(ctx);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, [subscription, onConnectionError]);

    useEffect(() => {
        client?.on('error', ({ error }) => onConnectionError(error));
        client?.connect();

        return () => {
            client?.disconnect();
        };
    }, [client, onConnectionError]);

    return (
        <RoomProvider
            client={client}
            subscription={subscription}
            room={room}
            user={user}
            isJoined={isJoined}
        >
            <Outlet />
        </RoomProvider>
    );
}
