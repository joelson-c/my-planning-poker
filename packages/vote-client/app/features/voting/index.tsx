import type { Route } from './+types';
import type { User } from '~/types/user';
import type { Room } from '~/types/room';
import { data, Link, redirect, useNavigate } from 'react-router';
import { VotingHeader } from './ongoing/header';
import { VotingCardList } from './ongoing/card/list';
import { VotingActionList } from './ongoing/actionList';
import { VotingUserList } from './ongoing/user/list';
import { commitSession, getSession } from '~/lib/session.server';
import { useEventSource } from '~/lib/useEventSource';
import { ClientResponseError } from 'pocketbase';
import { useEffect } from 'react';
import { useHeartbeat } from './useHeartbeat';

export function meta() {
    return [{ title: 'Planning Poker Room' }];
}

export async function loader({ params, request, context }: Route.LoaderArgs) {
    const { backend } = context;
    const session = await getSession(request.headers.get('Cookie'));

    async function redirectToRoomJoin() {
        return redirect(`/room/${params.roomId}/join`);
    }

    if (
        !backend.authStore.isValid ||
        backend.authStore.record?.collectionName !== 'vote_users'
    ) {
        return redirectToRoomJoin();
    }

    let currentUser;
    try {
        currentUser = await backend
            .collection('vote_users')
            .getOne(backend.authStore.record.id);
    } catch (error) {
        if (!(error instanceof ClientResponseError)) {
            throw error;
        }

        return redirectToRoomJoin();
    }

    return data(
        {
            currentUser,
        },
        {
            headers: {
                'Set-Cookie': await commitSession(session),
            },
        },
    );
}

export default function VotingIndex({
    loaderData,
    params: { roomId },
}: Route.ComponentProps) {
    const { currentUser } = loaderData;
    const navigate = useNavigate();
    const realtimeUrl = `/room/${roomId}/realtime`;
    const room = useEventSource<Room>(realtimeUrl, {
        event: 'room',
    });

    const roomError = useEventSource<Room>(realtimeUrl, {
        event: 'error',
    });

    const users = useEventSource<User[]>(realtimeUrl, {
        event: 'users',
    });

    useEffect(() => {
        if (!roomError) {
            return;
        }

        navigate(`/room/${roomId}/join`);
    }, [roomError]);

    useHeartbeat(roomId);

    if (!room) {
        return <p>Loading..</p>;
    }

    return (
        <main className="container mx-auto p-4 min-h-screen">
            <VotingHeader room={room} />
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex flex-col w-full">
                    <VotingCardList room={room} />
                    <VotingActionList room={room} />
                </div>
                <VotingUserList users={users || []} currentUser={currentUser} />
            </div>
        </main>
    );
}
