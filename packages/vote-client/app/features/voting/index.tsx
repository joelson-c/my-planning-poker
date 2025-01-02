import type { Route } from './+types';
import type { User } from '~/types/user';
import type { Room } from '~/types/room';
import { useEffect } from 'react';
import { data, redirect, useNavigate } from 'react-router';
import { ClientResponseError } from 'pocketbase';
import { VotingHeader } from './ongoing/header';
import { VotingCardList } from './ongoing/card/list';
import { VotingActionList } from './ongoing/actionList';
import { VotingUserList } from './ongoing/user/list';
import { commitSession, getSession } from '~/lib/session.server';
import { useEventSource } from '~/lib/useEventSource';

export function meta() {
    return [{ title: 'Planning Poker Room' }];
}

export async function loader({ params, request, context }: Route.LoaderArgs) {
    const { backend } = context;
    const session = await getSession(request.headers.get('Cookie'));

    async function redirectToRoomJoin() {
        session.flash('error', 'You must be joined to vote in this room.');

        return redirect(`/room/${params.roomId}/join`, {
            headers: {
                'Set-Cookie': await commitSession(session),
            },
        });
    }

    if (!backend.authStore.isValid) {
        return redirectToRoomJoin();
    }

    try {
        await backend
            .collection('vote_rooms')
            .getOne(params.roomId, { expand: 'users' });
    } catch (error) {
        if (!(error instanceof ClientResponseError)) {
            throw error;
        }

        return redirectToRoomJoin();
    }

    const currentUser = backend.authStore.record as User;

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
    const { data: room, hasError } = useEventSource<Room>(
        `/sse/room/${roomId}`,
        {
            event: 'room',
            init: { withCredentials: true },
        },
    );

    useEffect(() => {
        if (!hasError) {
            return;
        }

        navigate(`/room/${roomId}/join`);
    }, [hasError]);

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
                <VotingUserList
                    users={room.expand?.users || []}
                    currentUser={currentUser}
                />
            </div>
        </main>
    );
}
