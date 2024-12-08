import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import type { Error as CentrifugeError } from 'centrifuge';
import { json, Outlet, redirect, useLoaderData } from '@remix-run/react';
import { useCallback } from 'react';
import { refreshToken } from '~/lib/api/auth.server';
import { getMyJoinedRoom } from '~/lib/api/room';
import { env } from '~/lib/environment.server';
import { useToast } from '~/hooks/use-toast';
import { commitSession } from '~/lib/session';
import { RoomProvider } from './RoomProvider';
import { getCurrentUser } from '~/lib/api/user';
import { useCentrifuge } from './useCentrifuge';

export async function loader({ params, request }: LoaderFunctionArgs) {
    const { roomId } = params;
    if (!roomId) {
        throw new Response(null, { status: 404 });
    }

    const { token, session } = await refreshToken(request);
    const joinedRoom = await getMyJoinedRoom(token);
    if (!joinedRoom) {
        return redirect(`/join/${params.roomId}`);
    }

    const currentUser = await getCurrentUser(token);

    return json(
        {
            realtimeEndpoint: env.REALTIME_ENDPOINT,
            room: joinedRoom,
            user: currentUser,
        },
        {
            headers: {
                'Set-Cookie': await commitSession(session),
            },
        },
    );
}

export const meta: MetaFunction = () => {
    return [{ title: 'Voting Room - My Planning Poker' }];
};

export default function Room() {
    const { realtimeEndpoint, room, user } = useLoaderData<typeof loader>();
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

    const { client, isJoined, subscription } = useCentrifuge({
        roomId: room.id,
        realtimeEndpoint,
        onConnectionError,
    });

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
